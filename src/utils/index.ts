function getStatePaths(stateDir: string) {
  const stateJsonPath = stateDir + "/state.json";
  const artifactsDirPath = stateDir + "/artifacts";
  const logDirPath = stateDir + "/log";

  return {
    stateJsonPath,
    artifactsDirPath,
    logDirPath,
  };
}

export { getStatePaths };
