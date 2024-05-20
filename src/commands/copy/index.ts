import * as fs from "fs";

async function runCopy(
  framework: string,
  statePath: string,
  artifactLocation: string,
  artifactName: string,
  artifactOverwrite: string
) {
  if (framework !== "forge" && framework !== "hardhat") {
    console.error(
      `Error: Unsupported framework '${framework}'. Please use 'forge' or 'hardhat'.`
    );
    return;
  }

  if (framework === "hardhat") {
    console.error("Error: The 'hardhat' framework is not currently supported.");
    return;
  }

  const artifactFilePath = `${statePath}/artifacts/${artifactName}.json`;
  if (fs.existsSync(artifactFilePath)) {
    if (artifactOverwrite) {
      console.log(`Overwriting existing artifact at ${artifactFilePath}`);
    } else {
      console.error(
        `Artifact already exists at ${artifactFilePath} and overwrite is not enabled.`
      );
      return;
    }
  }

  let artifactAbi;
  let artifactBytecode;
  let methodIdentifiers;
  let artifactVersion;
  let compilationTarget;
  let compilerVersion;
  let optimizer;
  try {
    const artifactJson = JSON.parse(fs.readFileSync(artifactLocation, "utf8"));

    artifactAbi = artifactJson.abi;
    if (!artifactAbi) {
      console.error("ABI is missing in the artifact JSON.");
      return;
    }

    artifactBytecode = artifactJson.bytecode;
    if (!artifactBytecode) {
      console.error("Bytecode is missing in the artifact JSON.");
      return;
    }

    methodIdentifiers = artifactJson.methodIdentifiers;
    if (!methodIdentifiers) {
      console.error("Method identifiers are missing in the artifact JSON.");
      return;
    }

    artifactVersion = artifactJson.metadata
      ? artifactJson.metadata.version
      : undefined;
    if (!artifactVersion) {
      console.error("Version is missing in the artifact JSON metadata.");
      return;
    }

    compilationTarget =
      artifactJson.metadata && artifactJson.metadata.settings
        ? artifactJson.metadata.settings.compilationTarget
        : undefined;
    if (!compilationTarget) {
      console.error(
        "Compilation target is missing in the artifact JSON metadata."
      );
      return;
    }

    compilerVersion = artifactJson.metadata
      ? artifactJson.metadata.compiler.version
      : undefined;
    if (!compilerVersion) {
      console.error(
        "Compiler version is missing in the artifact JSON metadata."
      );
      return;
    }

    optimizer =
      artifactJson.metadata && artifactJson.metadata.settings
        ? artifactJson.metadata.settings.optimizer
        : undefined;
    if (!optimizer) {
      console.error(
        "Optimizer settings are missing in the artifact JSON metadata."
      );
      return;
    }
  } catch (error: any) {
    console.error(
      `Failed to read the artifact from ${artifactLocation}: ${error.message}`
    );
    return;
  }

  const artifactDetails = {
    repo_url: "",
    git_commit_hash: "",
    compilationTarget: compilationTarget,
    compiler_version: compilerVersion,
    optimizer: optimizer,
    version: artifactVersion,
    abi: artifactAbi,
    bytecode: artifactBytecode,
    methodIdentifiers: methodIdentifiers,
  };

  try {
    fs.writeFileSync(
      artifactFilePath,
      JSON.stringify(artifactDetails, null, 2)
    );
    console.log(
      `Artifact file ${artifactName}.json created at ${artifactFilePath}`
    );
  } catch (error: any) {
    console.error(`Failed to create artifact file: ${error.message}`);
  }
}

export { runCopy };
