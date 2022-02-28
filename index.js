#!/usr/bin/env node

import inquirer from "inquirer";
import { program } from "commander";

import { getSettings, getRawSettings, reconfigure } from "./setup.js";
import { createGitBranch } from "./git.js";
import { Github } from "./github.js";
import { Zenhub } from "./zenhub.js";
import { panic } from "./utils.js";

function formatIssue(issue) {
  const listPipelines = (zenhubData) => {
    if (!zenhubData) {
      return "";
    }
    const pipelines = zenhubData.pipelines.map(({ name }) => `[${name}]`);
    return pipelines.join(" ") + " ";
  };

  return [
    listPipelines(issue.zenhubData),
    issue.repoName,
    `#${issue.number}: `,
    issue.title,
  ].join("");
}

async function getIssuesChoiceList({ github, zenhub }) {
  const openIssues = await github.fetchOpenIssues();

  const issues = await Promise.all(
    openIssues.map(async (issue) => ({
      number: issue.number,
      title: issue.title,
      repoName: issue.repository.full_name,
      zenhubData:
        zenhub &&
        (await zenhub.fetchIssueData(issue.repository.id, issue.number)),
    }))
  );

  return issues.map((issue) => ({
    name: formatIssue(issue),
    value: issue,
  }));
}

function createTitle(title) {
  return title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
}

async function run() {
  const settings = await getSettings();
  const github = Github(settings);
  const zenhub = Zenhub(settings);

  const issues = await getIssuesChoiceList({ github, zenhub });

  if (issues.length === 0) {
    panic("You have no open issues");
  }

  const { issue } = await inquirer.prompt([
    {
      type: "list",
      name: "issue",
      message: "Choose an issue",
      choices: issues,
    },
  ]);

  const branchName = settings.branchNameTemplate
    .replace("{number}", issue.number)
    .replace("{title}", createTitle(issue.title));

  createGitBranch(branchName);
}

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
