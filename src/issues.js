function formatIssue(issue) {
  const listPipelines = (zenhubData) => {
    if (!zenhubData) {
      return "";
    }

    const { pipelines = [] } = zenhubData || {};
    const pipelinesNames = pipelines.map(({ name }) => `[${name}]`);

    return pipelinesNames.join(" ") + " ";
  };

  return [
    listPipelines(issue.zenhubData),
    issue.repoName,
    `#${issue.number}: `,
    issue.title,
  ].join("");
}

export async function getIssuesChoiceList({ github, zenhub }) {
  const openIssues = await github.fetchOpenIssues();

  const issues = await Promise.all(
    openIssues.map(async (issue) => ({
      number: issue.number,
      title: issue.title,
      repoName: issue.repository.full_name,
      zenhubData:
        zenhub &&
        (await zenhub.fetchIssueData(issue.repository.id, issue.number)),
    }))
  );

  return issues.map((issue) => ({
    name: formatIssue(issue),
    value: issue,
  }));
}
