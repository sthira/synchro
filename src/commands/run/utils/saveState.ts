import * as fs from "fs";

export async function saveConfigValueToState(
  stateJsonPath: string,
  type: string,
  contractName: string,
  configName: string,
  value: any
) {
  const stateData = JSON.parse(fs.readFileSync(stateJsonPath, "utf8"));
  const activeContract = stateData.contracts.active.find(
    (contract: any) => contract.name === contractName
  );
  if (!activeContract) {
    console.error(
      `Contract with name '${contractName}' not found in active contracts.`
    );
    return;
  }

  if (!activeContract.config) {
    console.error(`Config not found.`);
    return;
  }

  const currentConfig = activeContract.config.find(
    (config: any) => config.name === configName
  );
  if (!currentConfig) {
    console.error(
      `Config with name ${configName} not found in ${contractName}.`
    );
    return;
  }

  const current = currentConfig.transition.current;
  const next = currentConfig.transition.next;

  switch (type) {
    case "config_array_add":
      console.log(`Current Before: ${current}`);
      if (!Array.isArray(current)) {
        console.error(`Expected an array but got a different type.`);
        return;
      }
      current.push(value);

      console.log(`Current After: ${current}`);
      console.log(`Next          : ${next}`);
      break;
    case "config_array_remove":
      console.log(`Current Before: ${current}`);
      if (!Array.isArray(current)) {
        console.error(`Expected an array but got a different type.`);
        return;
      }
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        console.error(`Value '${value}' not found in current '${current}'.`);
        return;
      }

      console.log(`Current After: ${current}`);
      console.log(`Next          : ${next}`);
      break;
    case "config_value_add":
      console.log(`Configuration value added in state JSON: ${value}`);
      break;
    case "config_value_remove":
      console.log(`Configuration value removed in state JSON: ${value}`);
      break;
    default:
      console.error(`Unknown type '${type}' provided for saveStateToFile.`);
  }

  fs.writeFileSync(stateJsonPath, JSON.stringify(stateData, null, 2));
}

export async function saveContractAddressToState(
  stateJsonPath: string,
  name: string,
  value: any
) {
  const stateData = JSON.parse(fs.readFileSync(stateJsonPath, "utf8"));

  const activeContract = stateData.contracts.active.find(
    (contract: any) => contract.name === name
  );
  if (activeContract && activeContract.address === "") {
    activeContract.address = value;
    fs.writeFileSync(stateJsonPath, JSON.stringify(stateData, null, 2));
  } else {
    console.error(
      `Contract with name '${name}' not found in active contracts.`
    );
  }

  console.log(`Contract address updated in state JSON: ${value}`);
}
