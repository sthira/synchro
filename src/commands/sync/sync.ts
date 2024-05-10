import * as fs from "fs";
import { createWalletClient, Hex, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function runSync(filepath: string) {
  const stateFile = filepath;
  console.log("Reading state.json from: " + stateFile);

  // directories and files
  const stateDir = require("path").dirname(filepath);
  const artifactsDir = stateDir + "/artifacts";
  const logDir = stateDir + "/log";

  // read the state.json
  const state = JSON.parse(fs.readFileSync(filepath, "utf8"));

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

  const blockNumber = await client.getBlockNumber();
  console.log(`Current block number: ${blockNumber}`);

  /* steps to execute

  execute:
  - if a contract is deployed skip it
  - if a contract is not deployed run txn
  - update state object and record output to run log
  - repeat for other not deployed contracts

  record output:
  - save run log as a file

  ..
  */
}

export { runSync };
