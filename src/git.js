import { execSync } from "node:child_process";

function bufferHasTextContent(buffer) {
  return ("" + (buffer || "")).trim().length > 0;
}

export function createGitBranch(branchName) {
  const branchExists = bufferHasTextContent(
    execSync(`git branch -l "${branchName}"`)
  );

  if (!branchExists) {
    execSync(`git branch "${branchName}"`);
    console.log(`Created branch: ${branchName}`);
  }

  execSync(`git checkout "${branchName}"`);
}
