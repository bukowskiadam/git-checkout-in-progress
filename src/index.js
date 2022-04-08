import inquirer from "inquirer";

import {
  getSettingsWithPrompt,
  getSettings,
  reconfigure,
  clearSettings,
} from "./settings.js";
import { createGitBranch } from "./git.js";
import { Github } from "./github.js";
import { Zenhub } from "./zenhub.js";
import { getIssuesChoiceList } from "./issues.js";
import { askPrefilledQuestion } from "./user-input.js";
import { panic } from "./utils.js";

function createTitle(title) {
  return title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
}

async function run() {
  const settings = await getSettingsWithPrompt();
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

  const adjustedBranchName = await askPrefilledQuestion(
    "\nNow you can edit your branch name\n\nBranch name: ",
    branchName
  );

  createGitBranch(adjustedBranchName);
}

export { run, getSettings, reconfigure, clearSettings };
