#! /usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as figlet from "figlet";

import { runSync } from "./commands/run/run";

const program = new Command();

console.log(figlet.textSync("CHAIN SYNC"));

program.name("chainsync").version("1.0.0").description("CHAIN SYNC");

// run: run the sync process between state and networks
program
  .command("run")
  .description("chain sync run")
  .option("-s, --state <path>", "Location of state files", "./registry/global")
  .action((options) => {
    runSync(options.state);
  })
  .addHelpText(
    "after",
    `
  Examples:
    $ chainsync run -s ./registry/global`
  );

program.parse(process.argv);
