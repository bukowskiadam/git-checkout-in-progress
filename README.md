# Git Checkout In-Progress

## Configuration

Set those environment variables

```
GIT_CIP_GITHUB_TOKEN=<your personal access token>
GIT_CIP_GITHUB_API_URL=https://api.github.com
GIT_CIP_ZENHUB_TOKEN=<your zenhub token>
GIT_CIP_ZENHUB_API_URL=https://api.zenhub.com
GIT_CIP_ZENHUB_WORKSPACE_ID=<workspace id>
GIT_CIP_ZENHUB_REPO_ID=<repo id>
GIT_CIP_ZENHUB_IN_PROGRESS_PIPELINE=in progress
GIT_CIP_TEMPLATE=joe-doe/{number}/{title}
```

**Where do I get these?**

- [github personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- github api url - as above or your enterprise endpoint
- zenhub token - refer [ZenHub API documentation#Authentication](https://github.com/ZenHubIO/API#authentication)
- zenhub api url - as above or your custom one like described in the [#root-endpoint](https://github.com/ZenHubIO/API#root-endpoint)
- workspace id and repo id:
  if you open your board you should see url like:  
  `https://<zenhub url>/workspaces/some-name-555aaaaa5555aaaa66666444/board?repos=12345`  
  where `555aaaaa5555aaaa66666444` is your workspace id and `12345` is repo id
- in progress pipeline - **lowercased** name of your in progress pipeline
- template - branch name template of your choice. Can contain following replacement tags:
  - `{number}` - issue number
  - `{title}` - issue title containing only letters and numbers and a dash character (`-`) which replaces all other characters
