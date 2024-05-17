import * as fs from "fs";
import { createWalletClient, http, publicActions, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getStatePaths } from "../../utils";

async function runSync(stateDir: string) {
  const { stateJsonPath, artifactsDirPath, logDirPath } =
    getStatePaths(stateDir);

  const stateJson = JSON.parse(fs.readFileSync(stateJsonPath, "utf8"));
  console.log("Read state.json from: " + stateJsonPath);

  const activeContracts = stateJson.contracts.active;
  const networks = stateJson.info.networks;

  const runPrivateKey = process.env.RUN_PRIVATE_KEY;
  const alchemyAPIKey = process.env.RUN_ALCHEMY_API_KEY;

  if (!runPrivateKey || !alchemyAPIKey) {
    console.log(
      "Please set RUN_PRIVATE_KEY and RUN_ALCHEMY_API_KEY environment variables."
    );

    return;
  }

  // Create a wallet client with run private key
  const account = privateKeyToAccount(`0x${runPrivateKey}`);

  // ignore all draft contracts

  // read all active contracts and collect all undeployed contracts
  let undeployedContract: any = null;
  for (const contract of activeContracts) {
    // Step 0: Setup
    // create client to interact with the network of the contract
    const chainInfo = networks.find(
      (net: any) => net.network === contract.network_name
    );
    if (!chainInfo) {
      console.error(`Network details for ${contract.network_name} not found.`);
      return;
    }

    const chainConfig = defineChain({
      id: chainInfo.chainId,
      name: chainInfo.name,
      network: chainInfo.network,
      nativeCurrency: {
        decimals: chainInfo.currencyDecimals,
        name: chainInfo.currencyName,
        symbol: chainInfo.currencySymbol,
      },
      rpcUrls: {
        default: {
          http: [chainInfo.rpcUrlHTTP],
          webSocket: [chainInfo.rpcUrlWS],
        },
        public: {
          http: [chainInfo.rpcUrlHTTP],
          webSocket: [chainInfo.rpcUrlWS],
        },
      },
      blockExplorers: {
        default: {
          name: "Explorer",
          url: chainInfo.blockExplorer,
        },
      },
    });

    const client = createWalletClient({
      account: account,
      chain: chainConfig,
      transport: http(),
    }).extend(publicActions);

    // Step 1: Contract Deployment
    // deploy contract first if it has not been deployed
    if (contract.address === "") {
      undeployedContract = contract;

      console.log(
        `Preparing to deploy contract: ${undeployedContract.name} to ${chainConfig.network}`
      );

      // Resolve constructor arguments
      const constructorArgs = undeployedContract.constructor_args.map(
        (arg: any) => {
          const [group, key] = arg.split(":");
          if (
            !stateJson.info.values[group] ||
            !stateJson.info.values[group][key]
          ) {
            throw new Error(
              `Missing value for group: ${group} and key: ${key}`
            );
          }
          return stateJson.info.values[group][key];
        }
      );

      try {
        console.log(
          `Deploying contract: ${undeployedContract.name} with args: ${constructorArgs}`
        );

        // prompt a deployment confirmation
        // estimate gas

        // @ts-ignore
        const artifactJsonPath = `${artifactsDirPath}/${undeployedContract.artifact}.json`;
        console.log(`Loading artifact from: ${artifactJsonPath}`);
        const artifact = JSON.parse(fs.readFileSync(artifactJsonPath, "utf8"));
        if (!artifact || !artifact.abi || !artifact.bytecode) {
          throw new Error(
            `Failed to load artifact or missing ABI/bytecode for ${undeployedContract.artifact}`
          );
        }

        // @ts-ignore
        const hash = await client.deployContract({
          abi: artifact.abi,
          account: account,
          bytecode: artifact.bytecode.object,
          args: constructorArgs,
        });
        const transaction = await client.waitForTransactionReceipt({
          hash: hash,
        });

        // record the contract address of the deployed contract
        console.log(
          `Deployed at txn: https://sepolia.basescan.org/address/${transaction.contractAddress}`
        );

        // after success, save the contract address back to state.json
      } catch (error: any) {
        console.error(
          `Error deploying contract ${undeployedContract.name}: ${error.message}`
        );
      }
    }

    // Step 2: Contract Configuration
    console.log(
      `Preparing to run configuration of : ${contract.name} deployed on ${chainConfig.network}`
    );

    //
  }
}

export { runSync };
