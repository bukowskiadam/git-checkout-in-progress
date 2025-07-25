import { panic } from "./utils.js";

export function Github({ githubApiUrl, githubToken }) {
  const issuesUrl = `${githubApiUrl.replace(/\/$/, "")}/issues`;

  const fetchOpenIssues = async () => {
    try {
      const response = await fetch(issuesUrl, {
        headers: {
          accept: "application/vnd.github.inertia-preview+json",
          authorization: `token ${githubToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      panic(
        "We've got a problem fetching your github issues list.\n" +
          "Make sure you've got some issues assigned to you or your token has control over private repositories.\n",
        error.toString()
      );
    }
  };

  return { fetchOpenIssues };
}
