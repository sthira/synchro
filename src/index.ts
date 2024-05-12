#! /usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as figlet from "figlet";

import { runSync } from "./commands/run";
import { runCopy } from "./commands/copy";

const program = new Command();

console.log(figlet.textSync("CHAIN SYNC"));

program.name("chainsync").version("1.0.0").description("CHAIN SYNC");

// run: run the sync process between state and networks
program
  .command("run")
  .description("chain sync run")
  .option("-s, --state <path>", "Location of state files")
  .action((options) => {
    runSync(options.state);
  })
  .addHelpText(
    "after",
    `
  Examples:
    $ chainsync run -s ./registry/global`
  );

// copy: run the copy process
program
  .command("copy")
  .description("chain sync copy")
  .option("-f, --framework <forge|hardhat>", "Solidity framework", "forge")
  .option("-s, --state <path>", "Location of state files")
  .option("-a, --artifact <location>", "Artifact location")
  .option("-n, --name <name>", "Artifact name")
  .option(
    "-o, --overwrite",
    "Allow command to overwrite an existing artifact entry"
  )
  .action((options) => {
    runCopy(
      options.framework,
      options.state,
      options.artifact,
      options.name,
      options.overwrite
    );
  })
  .addHelpText(
    "after",
    `
  Examples:
    $ chainsync copy -f forge -s ./registry/global -a ./out/GameWallet.sol/GameWallet.json -n GW02 -o`
  );

program.parse(process.argv);
