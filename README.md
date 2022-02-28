# Git Checkout In-Progress

Allows you to easily create a new branch based on one of your opened github issues.

It can also sync with ZenHub to fetch pipeline name for the issues, so it is easier
to identify your issues.

## Installation

This CLI is ESM module only. Make sure you use some recent version of Node.

```
npm install -g git-cip
```

It should add `git-cip` executable to your shell.
You can execute it like any other git commands

```
git cip
```

**Note:** keep in mind that global installation might add binary just for a currently
selected version of Node. Switching node versions with `nvm`, or `fnm` might make
command unavailable.

You can use mix of shell aliases and `nvm exec` / `fnm exec` to always execute
this CLI with a specific version of Node.

## Configuration

During the first run you'll get prompted for all needed configuration options.

Zenhub integration is optional and you can skip providing a zenhub token.

**Where do I get these?**

- [github personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- github api url - as above or your enterprise endpoint
- zenhub token - refer [ZenHub API documentation#Authentication](https://github.com/ZenHubIO/API#authentication)
- zenhub api url - as above or your custom one like described in the [#root-endpoint](https://github.com/ZenHubIO/API#root-endpoint)
- template - branch name template of your choice. Can contain following replacement tags:
  - `{number}` - issue number
  - `{title}` - issue title containing only letters and numbers and a dash character (`-`) which replaces all other characters

## CLI options and commands

```
Usage: git cip [options] [command]

It helps to create a branch for one of your open issues

Options:
  -h, --help   display help for command

Commands:
  config       Prints current configuration
  reconfigure  Runs config prompt again
```