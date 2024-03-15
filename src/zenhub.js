import got from "got";

import { panic } from "./utils.js";

export function Zenhub({ zenhubApiUrl, zenhubToken }) {
  if (!zenhubApiUrl || !zenhubToken) {
    return null;
  }

  const baseUrl = `${zenhubApiUrl.replace(/\/$/, "")}/p1/repositories`;

  const fetchIssueData = async (repoId, issueId) => {
    try {
      return await got(`${baseUrl}/${repoId}/issues/${issueId}`, {
        headers: {
          "X-Authentication-Token": zenhubToken,
        },
      }).json();
    } catch (error) {
      panic("Error fetching Zenhub data: ", error.toString());
    }
  };

  return { fetchIssueData };
}
