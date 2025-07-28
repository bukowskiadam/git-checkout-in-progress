import { panic } from "./utils.js";

export function Github({ githubApiUrl, githubToken }) {
  const baseUrl = githubApiUrl.replace(/\/$/, "");
  const issuesUrl = `${baseUrl}/issues`;
  const graphqlUrl = `${baseUrl}/graphql`;

  // Cache for project data to reduce API calls
  const projectCache = new Map();

  const makeGraphQLRequest = async (query, variables = {}) => {
    try {
      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${githubToken}`,
          "User-Agent": "git-checkout-in-progress",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.warn("⚠️  GraphQL errors occurred:");
        for (const error of data.errors) {
          console.warn(`   - ${error.message}`);
          if (error.message.includes("rate limit")) {
            console.warn("   💡 Consider using a GitHub token with higher rate limits");
          }
          if (error.message.includes("permission")) {
            console.warn("   💡 Make sure your token has access to Projects (beta) scope");
          }
        }
        return null;
      }

      return data.data;
    } catch (error) {
      if (error.message.includes("rate limit")) {
        console.warn("🚫 GitHub API rate limit exceeded. Please wait and try again.");
      } else {
        console.warn("❌ GraphQL request failed:", error.message);
      }
      return null;
    }
  };

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
        error.toString(),
      );
    }
  };

  const fetchProjectsForIssue = async (issue) => {
    if (!issue.repository?.full_name || !issue.number) {
      return null;
    }

    const [owner, repo] = issue.repository.full_name.split("/");
    const cacheKey = `${owner}/${repo}#${issue.number}`;

    if (projectCache.has(cacheKey)) {
      return projectCache.get(cacheKey);
    }

    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            projectItems(first: 10) {
              nodes {
                id
                project {
                  id
                  title
                  number
                  url
                  shortDescription
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      number
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await makeGraphQLRequest(query, {
      owner,
      repo,
      number: issue.number,
    });

    if (!data?.repository?.issue?.projectItems?.nodes) {
      projectCache.set(cacheKey, null);
      return null;
    }

    const projectItems = data.repository.issue.projectItems.nodes;

    if (projectItems.length === 0) {
      projectCache.set(cacheKey, null);
      return null;
    }

    // Get the first project item (most issues are in one project)
    const projectItem = projectItems[0];
    const project = projectItem.project;

    // Try to find the most relevant status field with priority
    const fieldValues = projectItem.fieldValues.nodes;

    // Priority order for field names that might represent status/column
    const statusFieldPriority = ["status", "state", "column", "stage", "phase", "progress"];

    let statusField = null;

    // First, try to find a field that exactly matches our priority list
    for (const priority of statusFieldPriority) {
      statusField = fieldValues.find((field) => field.field?.name?.toLowerCase() === priority);
      if (statusField) break;
    }

    // If no exact match, find any field that contains these keywords
    if (!statusField) {
      for (const priority of statusFieldPriority) {
        statusField = fieldValues.find((field) =>
          field.field?.name?.toLowerCase().includes(priority),
        );
        if (statusField) break;
      }
    }

    // If still no status field, take the first available field with a value
    if (!statusField) {
      statusField = fieldValues.find(
        (field) => field.name || field.text || field.number || field.date,
      );
    }

    const getFieldValue = (field) => {
      if (field?.name) return field.name;
      if (field?.text) return field.text;
      if (field?.number) return field.number.toString();
      if (field?.date) return field.date;
      return null;
    };

    const result = {
      projectName: project.title,
      columnName: getFieldValue(statusField) || "No Status",
      projectId: project.id,
      projectNumber: project.number,
      projectUrl: project.url,
      projectDescription: project.shortDescription || null,
    };

    projectCache.set(cacheKey, result);
    return result;
  };

  return {
    fetchOpenIssues,
    fetchProjectsForIssue,
  };
}
