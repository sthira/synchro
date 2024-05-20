import { setupClient } from "./setup/setup";
import { deployContract } from "./deploy/deployContract";
import { runConfigurations } from "./config/runConfigurations";

import * as fs from "fs";

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
  if (!runPrivateKey) {
    console.log("Please set RUN_PRIVATE_KEY environment variable.");

    return;
  }
  const account = privateKeyToAccount(`0x${runPrivateKey}`);

  // ignore all draft contracts

  for (const contract of activeContracts) {
    const client = setupClient(networks, contract, account);
    if (!client) continue;

    await deployContract(
      client,
      account,
      contract,
      stateJson,
      stateJsonPath,
      artifactsDirPath
    );
  }

  const stateJsonUpdated = JSON.parse(fs.readFileSync(stateJsonPath, "utf8"));
  console.log("Read state.json after deployments from: " + stateJsonPath);

  const activeContractsUpdated = stateJsonUpdated.contracts.active;

  for (const contract of activeContractsUpdated) {
    const client = setupClient(networks, contract, account);
    if (!client) continue;

    await runConfigurations(
      client,
      account,
      contract,
      stateJsonUpdated,
      stateJsonPath,
      artifactsDirPath
    );
  }
}

export { runSync };
