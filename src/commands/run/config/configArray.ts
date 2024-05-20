import * as fs from "fs";
import { parseEther } from "viem";
import { saveConfigValueToState } from "../utils/saveState";

export async function configArray(
  configItem: any,
  client: any,
  account: any,
  contract: any,
  stateJson: any,
  stateJsonPath: any,
  artifactsDirPath: any,
  current: any,
  next: any
) {
  // determine if config needs to be run
  if (!Array.isArray(current) && !Array.isArray(next)) {
    console.log(`Curernt and Next in ${configItem.name} are not arrays.`);
    return;
  }

  if (JSON.stringify(current.sort()) === JSON.stringify(next.sort())) {
    console.log(`No changes required for ${configItem.name}. Skipping update.`);
    return;
  }

  console.log(
    `Changes detected for ${configItem.name}. Proceeding with update.`
  );

  // prepare a new transaction array with actions assigned to values
  const currentCopy = [...current];
  const nextCopy = [...next];
  const txnList = [];

  // no updates to run on values that are the same in both current and next
  // when a single value is present in both current and next, config is skipped
  // skip txn
  for (const value of currentCopy) {
    if (nextCopy.includes(value)) {
      // remove skipped value from both currentCopy and nextCopy
      currentCopy.splice(currentCopy.indexOf(value), 1);
      nextCopy.splice(nextCopy.indexOf(value), 1);
    }
  }

  // all remaining values in nextCopy can be tagged with add
  // to use a transaction to add them to current later
  for (const value of nextCopy) {
    txnList.push({
      action: "add",
      function_sig: configItem.updateStrategy.add.function_sig,
      args: configItem.updateStrategy.add.args,
      value: value,
    });
  }

  // all remaining values in currentCopy can be tagged with remove
  // to use a transaction to remove them from current later
  for (const value of currentCopy) {
    txnList.push({
      action: "remove",
      function_sig: configItem.updateStrategy.remove.function_sig,
      args: configItem.updateStrategy.remove.args,
      value: value,
    });
  }

  // run each transaction and edit the config section in the state.json file
  for (const txn of txnList) {
    // @ts-ignore
    const artifactJsonPath = `${artifactsDirPath}/${contract.artifact}.json`;
    console.log(`Loading artifact from: ${artifactJsonPath}`);
    const artifact = JSON.parse(fs.readFileSync(artifactJsonPath, "utf8"));
    if (!artifact || !artifact.abi || !artifact.bytecode) {
      throw new Error(
        `Failed to load artifact or missing ABI/bytecode for ${contract.artifact}`
      );
    }

    // find the abi associated with the function name
    const functionName = txn.function_sig.split("(")[0];
    // todo: find from the given json file for a function when present
    const functionAbi = [
      artifact.abi.find(
        (abiItem: any) =>
          abiItem.name === functionName && abiItem.type === "function"
      ),
    ];

    if (!functionAbi) {
      throw new Error(
        `Function ABI for ${functionName} not found in artifact.`
      );
    }

    // create an args array with values
    const args = txn.args.map((arg: any) => {
      if (arg === "_") {
        const [group, key] = txn.value.split(":");
        return stateJson.info.values[group][key];
      } else {
        const [group, key] = arg.split(":");
        return stateJson.info.values[group][key];
      }
    });

    const { request } = await client.simulateContract({
      account,
      address: contract.address,
      abi: functionAbi,
      functionName: functionAbi[0].name,
      args: args,
    });
    const txnHash = await client.writeContract(request);
    console.log(`https://base-sepolia.blockscout.com/tx/${txnHash}`);

    const transaction = await client.waitForTransactionReceipt({
      confirmations: 5,
      hash: txnHash,
    });

    console.log("confirmed!");

    // modify state.json
    if (txn.action === "add") {
      saveConfigValueToState(
        stateJsonPath,
        "config_array_add",
        contract.name,
        configItem.name,
        txn.value
      );
    } else if (txn.action === "remove") {
      saveConfigValueToState(
        stateJsonPath,
        "config_array_remove",
        contract.name,
        configItem.name,
        txn.value
      );
    }
  }
}
