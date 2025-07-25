import { execSync } from "node:child_process";
import { panic } from "./utils.js";

export function createGitBranch(branchName) {
  try {
    // Check if we're in a git repository
    execSync("git rev-parse --git-dir", { stdio: "pipe" });

    // Check if branch already exists
    const branchExists = execSync(`git branch -l "${branchName}"`, {
      stdio: "pipe",
      encoding: "utf8",
    });

    if (!branchExists.trim()) {
      execSync(`git branch "${branchName}"`);
      console.log(`Created branch: ${branchName}`);
    } else {
      console.log(`Branch ${branchName} already exists`);
    }

    execSync(`git checkout "${branchName}"`);
  } catch (error) {
    if (error.status === 128) {
      panic(
        "Error: Not in a git repository. Please run this command from within a git repository.",
      );
    }
    panic(`Git operation failed: ${error.message}`);
  }
}
