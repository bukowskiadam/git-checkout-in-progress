import got from "got";

import { panic } from "./utils.js";

export function Github({ githubApiUrl, githubToken }) {
  const fetchOpenIssues = async () => {
    try {
      return await got(`${githubApiUrl}/v3/issues`, {
        headers: {
          accept: "application/vnd.github.inertia-preview+json",
          authorization: `token ${githubToken}`,
        },
      }).json();
    } catch (error) {
      panic("Error fetching github issues: ", error.toString());
    }
  };

  return { fetchOpenIssues };
}
