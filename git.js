import { execSync } from "node:child_process";

export function createGitBranch(branchName) {
  const branchExists = execSync(`git branch -l "${branchName}"`)?.toString();
  if (!branchExists) {
    execSync(`git branch "${branchName}"`);
    console.log(`Created branch: ${branchName}`);
  }
  execSync(`git checkout "${branchName}"`);
}
