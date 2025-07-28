# Git Checkout In-Progress

Allows you to easily create a new branch based on one of your opened github issues.

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

**Where do I get these?**

- [github personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- github api url - as above or your enterprise endpoint
- template - branch name template of your choice. Can contain following replacement tags:
  - `{number}` - issue number
  - `{title}` - issue title containing only letters and numbers and a dash character (`-`) which replaces all other characters
  - `{org}` - organization or owner name from the issue's repository
  - `{repo}` - repository name from the issue's repository

**Config storage**

You API keys are stored in a secured keychain using [keytar](https://github.com/atom/node-keytar) package.

Non-secret config is stored using [conf](https://github.com/sindresorhus/conf) package.

## CLI options and commands

```
Usage: git cip [options] [command]

It helps to create a branch for one of your open issues

Options:
  -h, --help   display help for command

Commands:
  config       Prints current configuration
  reconfigure  Runs config prompt again
  reset-config Clears config data
```

## Features

- ✅ **Branch Name Validation**: Ensures valid Git branch names
- 🔒 **Secure Storage**: API tokens stored securely in system keychain
- 🎯 **Multi-Repository Support**: Works with issues from all your repositories

## Development

```bash
# Install dependencies
npm install

# Run full check (lint + format)
npm run check

# Fix all issues (lint + format)
npm run check:fix

# Test locally
npm run dev
```
