#!/usr/bin/env node

import { program } from "commander";

import { run, getRawSettings, reconfigure } from "./src/index.js";

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
    console.log(await getRawSettings());
  });

program
  .command("reconfigure")
  .description("Runs config prompt again")
  .action(() => {
    reconfigure();
  });

program.parse();
