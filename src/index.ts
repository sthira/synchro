#! /usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as figlet from "figlet";

import { runSync } from "./commands/sync/sync";

const program = new Command();

console.log(figlet.textSync("CHAIN SYNC"));

program.name("chainsync").version("1.0.0").description("CHAIN SYNC");

// generate: generate merkle tree and add to dataset
program
  .command("sync")
  .description("chain sync")
  .option(
    "-f, --file <path>",
    "Location of the state file",
    "./registry/global/state.json"
  )
  .action((options) => {
    runSync(options.file);
  })
  .addHelpText(
    "after",
    `
  Examples:
    $ chainsync sync -f ./registry/global/state.json`
  );

program.parse(process.argv);
