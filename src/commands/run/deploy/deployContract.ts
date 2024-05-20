import * as fs from "fs";
import { saveContractAddressToState } from "../utils/saveState";

export async function deployContract(
  client: any,
  account: any,
  contract: any,
  stateJson: any,
  stateJsonPath: any,
  artifactsDirPath: any
) {
  let undeployedContract;

  // deploy contract first if it has not been deployed
  if (contract.address === "") {
    undeployedContract = contract;

    console.log(`Preparing to deploy contract: ${undeployedContract.name}`);

    // Resolve constructor arguments
    const constructorArgs = undeployedContract.constructor_args.map(
      (arg: any) => {
        const [group, key] = arg.split(":");
        if (
          !stateJson.info.values[group] ||
          !stateJson.info.values[group][key]
        ) {
          throw new Error(`Missing value for group: ${group} and key: ${key}`);
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
        confirmations: 5,
        hash: hash,
      });

      // record the contract address of the deployed contract
      console.log(
        `Deployed at txn: https://base-sepolia.blockscout.com/address/${transaction.contractAddress}`
      );

      // after success, save the contract address back to state.json
      saveContractAddressToState(
        stateJsonPath,
        contract.name,
        transaction.contractAddress
      );
    } catch (error: any) {
      console.error(
        `Error deploying contract ${undeployedContract.name}: ${error.message}`
      );
    }
  }
}
