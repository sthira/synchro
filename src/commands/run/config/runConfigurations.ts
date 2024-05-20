import * as fs from "fs";
import { parseEther } from "viem";
import { configSingle } from "./configSingle";
import { configArray } from "./configArray";

export async function runConfigurations(
  client: any,
  account: any,
  contract: any,
  stateJson: any,
  stateJsonPath: any,
  artifactsDirPath: any
) {
  console.log(`Preparing to run configurations of : ${contract.name} `);

  for (const configItem of contract.config) {
    // find current and next values
    const { current, next } = configItem.transition;

    if (Array.isArray(current) !== Array.isArray(next)) {
      console.log(
        `Mismatch in array types for ${configItem.name}: current is ${
          Array.isArray(current) ? "an array" : "not an array"
        }, next is ${Array.isArray(next) ? "an array" : "not an array"}.`
      );
      break;
    }

    if (Array.isArray(current) && Array.isArray(next)) {
      await configArray(
        configItem,
        client,
        account,
        contract,
        stateJson,
        stateJsonPath,
        artifactsDirPath,
        current,
        next
      );
    } else {
      await configSingle(
        configItem,
        client,
        account,
        contract,
        stateJson,
        artifactsDirPath,
        current,
        next
      );
    }
  }
}
