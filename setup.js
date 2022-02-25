import OS from "node:os";
import Conf from "conf";
import inquirer from "inquirer";
import keytar from "keytar";

const { username } = OS.userInfo();
const APP_NAME = "git-cip";

const config = new Conf();
const configValues = [
  {
    name: "githubApiUrl",
    message: "Github API URL",
    default: "https://api.github.com/",
    validate: Boolean,
  },
  {
    name: "githubToken",
    message: "Github Personal Token",
    type: "password",
    mask: "*",
    validate: Boolean,
  },
  {
    name: "zenhubApiUrl",
    message: "ZenHub API URL",
    default: "https://api.zenhub.com/",
    validate: Boolean,
  },
  {
    name: "zenhubToken",
    message: "ZenHub Token",
    type: "password",
    mask: "*",
    validate: Boolean,
  },
  {
    name: "zenhubWorkspaceId",
    message: "ZenHub Workspace ID",
    validate: Boolean,
  },
  {
    name: "zenhubRepoId",
    message: "ZenHub Repo ID",
    validate: Boolean,
  },
  {
    name: "inProgressPipelineName",
    message: 'Name of the "In progress" pipeline (case-insensitive)',
    default: "in progress",
    validate: Boolean,
  },
  {
    name: "branchNameTemplate",
    default: `${username}/{number}/{title}`,
    validate: Boolean,
  },
];

async function promptUserSettings(existingConfig) {
  const settings = await inquirer.prompt(configValues, existingConfig);

  return settings;
}

async function saveSettings(settings) {
  const { githubToken, zenhubToken, ...nonSecretSettings } = settings;

  config.set(nonSecretSettings);

  await keytar.setPassword(APP_NAME, "githubToken", githubToken);
  await keytar.setPassword(APP_NAME, "zenhubToken", zenhubToken);
}

async function getRawSettings() {
  const settings = { ...config.store };

  const githubToken = await keytar.getPassword(APP_NAME, "githubToken");
  const zenhubToken = await keytar.getPassword(APP_NAME, "zenhubToken");

  githubToken && (settings.githubToken = githubToken);
  zenhubToken && (settings.zenhubToken = zenhubToken);

  return settings;
}

export async function getSettings() {
  const settings = await getRawSettings();

  const missingSettings = configValues
    .map((config) => config.name)
    .filter((configName) => !settings[configName]);

  if (missingSettings.length > 0) {
    console.log(`Some configuration options are missing.`);

    const newSettings = await promptUserSettings(settings);
    await saveSettings(newSettings);

    return getSettings();
  }

  return settings;
}

export async function cleanupSettings() {
  await keytar.deletePassword(APP_NAME, "githubToken");
  await keytar.deletePassword(APP_NAME, "zenhubToken");

  config.clear();
}
