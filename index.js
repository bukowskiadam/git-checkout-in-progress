#!/usr/bin/env node

import { execSync } from "child_process";
import got from "got";
import inquirer from "inquirer";

const {
  GIT_CIP_GITHUB_TOKEN: githubToken,
  GIT_CIP_GITHUB_API_URL: githubApiUrl,
  GIT_CIP_ZENHUB_TOKEN: zenhubToken,
  GIT_CIP_ZENHUB_API_URL: zenhubApiUrl,
  GIT_CIP_ZENHUB_WORKSPACE_ID: zenhubWorkspaceId,
  GIT_CIP_ZENHUB_REPO_ID: zenhubRepoId,
  GIT_CIP_ZENHUB_IN_PROGRESS_PIPELINE: inProgressPipelineName,
  GIT_CIP_TEMPLATE: branchNameTemplate,
} = process.env;

const missingEnvs = [
  "GIT_CIP_GITHUB_TOKEN",
  "GIT_CIP_GITHUB_API_URL",
  "GIT_CIP_ZENHUB_TOKEN",
  "GIT_CIP_ZENHUB_API_URL",
  "GIT_CIP_ZENHUB_WORKSPACE_ID",
  "GIT_CIP_ZENHUB_REPO_ID",
  "GIT_CIP_ZENHUB_IN_PROGRESS_PIPELINE",
  "GIT_CIP_TEMPLATE",
].filter((env) => !process.env[env]);

if (missingEnvs.length) {
  panic(
    `Configuration environment variables missing:\n - ${missingEnvs.join(
      "\n - "
    )}`
  );
}

function panic(message) {
  console.error(message);
  process.exit(1);
}

async function getIssuesInProgress() {
  let openIssues;
  let zenhubBoard;

  try {
    openIssues = await got(`${githubApiUrl}/v3/issues`, {
      headers: {
        accept: "application/vnd.github.inertia-preview+json",
        authorization: `token ${githubToken}`,
      },
    }).json();
  } catch (error) {
    panic("Error fetching github issues: ", error.toString());
  }

  try {
    zenhubBoard = await got(
      `${zenhubApiUrl}/p2/workspaces/${zenhubWorkspaceId}/repositories/${zenhubRepoId}/board`,
      {
        headers: {
          "X-Authentication-Token": zenhubToken,
        },
      }
    ).json();
  } catch (error) {
    panic("Error fetching zenhub board: ", error.toString());
  }

  const inProgressPipeline = zenhubBoard.pipelines.find(
    (pipeline) => pipeline.name.toLowerCase() === inProgressPipelineName
  );
  const issuesInProgress = inProgressPipeline.issues
    .map((issue) =>
      openIssues.find((openIssue) => openIssue.number === issue.issue_number)
    )
    .filter(Boolean);

  return issuesInProgress;
}

function createGitBranch(branchName) {
  const branchExists = execSync(`git branch -l "${branchName}"`)?.toString();
  if (!branchExists) {
    execSync(`git branch "${branchName}"`);
    console.log(`Created branch: ${branchName}`);
  }
  execSync(`git checkout "${branchName}"`);
}

function createTitle(title) {
  return title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
}

async function run() {
  const issuesInProgress = await getIssuesInProgress();
  let selectedIssue;

  switch (issuesInProgress.length) {
    case 0:
      panic("No issues in progress");
    case 1:
      selectedIssue = issuesInProgress[0];
      break;
    default:
      const { issue } = await inquirer.prompt([
        {
          type: "list",
          name: "issue",
          message: "Choose an issue",
          choices: issuesInProgress.map((issue) => ({
            name: `#${issue.number}: ${issue.title}`,
            value: issue,
          })),
        },
      ]);

      selectedIssue = issue;
  }

  const branchName = branchNameTemplate
    .replace("{number}", selectedIssue.number)
    .replace("{title}", createTitle(selectedIssue.title));

  createGitBranch(branchName);
}

run();
