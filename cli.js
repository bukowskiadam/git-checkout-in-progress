#!/usr/bin/env node

import { program } from "commander";

import { run, getSettings, reconfigure, clearSettings } from "./src/index.js";

program
  .name("git cip")
  .description("It helps to create a branch for one of your open issues")
  .action(() => {
    run();
  });

program
  .command("config")
  .description("Prints current configuration")
  .action(async () => {
    console.log(await getSettings());
  });

program
  .command("reconfigure")
  .description("Runs config prompt again")
  .action(() => {
    reconfigure();
  });

program
  .command("reset-config")
  .description("Clears config data")
  .action(() => {
    clearSettings();
  });

program.parse();
