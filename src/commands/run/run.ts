import * as fs from "fs";
import { createWalletClient, Hex, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function runSync(stateDir: string) {
  const stateFile = stateDir + "/state.json";
  console.log("Reading state.json from: " + stateFile);

  // directories and files
  // const stateDir = require("path").dirname(stateDir);
  const artifactsDir = stateDir + "/artifacts";
  const logDir = stateDir + "/log";

  // read the state.json
  const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));

  // active contracts
  const activeContracts = state.contracts.active;

  // archived contracts
  const archivedContracts = state.contracts.archive;

  // artifacts
  // @ts-ignore
  const artifactDetails = state.info.artifacts.map((artifactName) => {
    const artifactPath = artifactsDir + `/${artifactName}.json`;
    console.log("Reading artifact info from: " + artifactPath);
    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  });

  const networks = state.info.networks;

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
  const client = createWalletClient({
    account: account,
    chain: baseSepolia,
    transport: http(),
  }).extend(publicActions);

  // const blockNumber = await client.getBlockNumber();
  // console.log(`Current block number: ${blockNumber}`);

  // deploy the contract
  // command to deploy a contract with viem

  const [address] = await client.getAddresses();

  // Extract the ABI from the artifact details for 'gw01.json'
  // @ts-ignore
  const gw01Artifact = artifactDetails.find((artifact) =>
    artifact.repo_url.includes("game-wallet")
  );
  if (!gw01Artifact) {
    console.error("gw01.json artifact details not found.");
    return;
  }
  const gw01Abi = gw01Artifact.abi;
  const gw01Bytecode = gw01Artifact.bytecode.object;
  if (!gw01Abi) {
    console.error("ABI for gw01.json is missing.");
    return;
  }
  console.log("Successfully retrieved ABI for gw01.json.");

  const hash = await client.deployContract({
    abi: gw01Abi,
    account: account,
    bytecode: gw01Bytecode,
    args: ["0x036CbD53842c5426634e7929541eC2318f3dCF7e", 1000000000, 60],
  });
  const transaction = await client.waitForTransactionReceipt({
    hash: hash,
  });

  // record the contract address of the deployed contract
  console.log(
    `Deployed at txn: https://sepolia.basescan.org/address/${transaction.contractAddress}`
  );

  // update state file

  // come up with a check to skip deployment on the same state file

  // record output:
  // - save run log as a file

  // run auth configuration by executing function
  // look at cannon invoke

  // ability to loop
}

export { runSync };
