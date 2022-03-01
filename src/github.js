import got from "got";

import { panic } from "./utils.js";

export function Github({ githubApiUrl, githubToken }) {
  const fetchOpenIssues = async () => {
    try {
      return await got(`${githubApiUrl}/issues`, {
        headers: {
          accept: "application/vnd.github.inertia-preview+json",
          authorization: `token ${githubToken}`,
        },
      }).json();
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
