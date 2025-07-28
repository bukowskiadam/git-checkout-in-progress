function formatIssue(issue) {
  const projectInfo = issue.projectInfo
    ? ` [${issue.projectInfo.projectName}/${issue.projectInfo.columnName}]`
    : "";
  return [issue.repoName, `#${issue.number}: `, issue.title, projectInfo].join("");
}

export async function getIssuesChoiceList({ github }) {
  const openIssues = await github.fetchOpenIssues();

  console.log("🔍 Fetching project information for issues...");

  const issues = await Promise.all(
    openIssues.map(async (issue) => {
      // Fetch project information for each issue
      const projectInfo = await github.fetchProjectsForIssue(issue);

      return {
        number: issue.number,
        title: issue.title,
        repoName: issue.repository.full_name,
        projectInfo,
      };
    }),
  );

  console.log("✅ Done fetching project information!\n");

  return issues.map((issue) => ({
    name: formatIssue(issue),
    value: issue,
  }));
}
