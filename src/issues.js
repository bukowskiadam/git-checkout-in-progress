function formatIssue(issue) {
  return [
    issue.repoName,
    `#${issue.number}: `,
    issue.title,
  ].join("");
}

export async function getIssuesChoiceList({ github }) {
  const openIssues = await github.fetchOpenIssues();

  const issues = openIssues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    repoName: issue.repository.full_name,
  }));

  return issues.map((issue) => ({
    name: formatIssue(issue),
    value: issue,
  }));
}
