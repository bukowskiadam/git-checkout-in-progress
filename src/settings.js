import OS from "node:os";
import Conf from "conf";
import inquirer from "inquirer";
import keytar from "keytar";

const { username } = OS.userInfo();
const APP_NAME = "git-cip";

const config = new Conf({
  projectName: "git-cip",
});

const configSchema = [
  {
    name: "githubApiUrl",
    message: "Github API URL",
    default: "https://api.github.com",
    validate: Boolean,
  },
  {
    name: "githubToken",
    message: "Github Personal Token",
    type: "password",
    mask: "*",
    validate: async (newToken) => {
      const savedToken = await keytar.getPassword(APP_NAME, "githubToken");
      const valid = Boolean(newToken) || Boolean(savedToken);
      return valid || "Github token is required";
    },
  },
  {
    name: "branchNameTemplate",
    message: "Branch name template",
    default: `${username}/{org}/{repo}/{number}/{title}`,
    validate: Boolean,
  },
];

async function promptUserSettings(existingConfig, schema = configSchema) {
  try {
    const settings = await inquirer.prompt(schema, existingConfig);
    return settings;
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("\nOperation cancelled by user.");
      process.exit(0);
    }
    throw error;
  }
}

async function saveSettings(settings) {
  const { githubToken, ...nonSecretSettings } = settings;

  config.set(nonSecretSettings);

  if (githubToken) {
    await keytar.setPassword(APP_NAME, "githubToken", githubToken);
  }
}

export async function getSettings() {
  const settings = { ...config.store };

  const githubToken = await keytar.getPassword(APP_NAME, "githubToken");

  if (githubToken) {
    settings.githubToken = githubToken;
  }

  // remove old ZenHub API URL and credentials if it exists
  if ("zenhubApiUrl" in settings) {
    delete settings.zenhubApiUrl;
    await saveSettings(settings);
    await keytar.deletePassword(APP_NAME, "zenhubApiUrl");
  }

  return settings;
}

export async function getSettingsWithPrompt() {
  const settings = await getSettings();

  const missingSettings = configSchema
    .filter((config) => !!config.validate) // only required
    .map((config) => config.name)
    .filter((configName) => !settings[configName]);

  if (missingSettings.length > 0) {
    console.log(`Some configuration options are missing.`);

    const newSettings = await promptUserSettings(settings);
    await saveSettings(newSettings);

    return getSettingsWithPrompt();
  }

  return settings;
}

export async function clearSettings() {
  await keytar.deletePassword(APP_NAME, "githubToken");

  config.clear();
}

export async function reconfigure() {
  const settings = await getSettings();

  const schema = configSchema.map((option) => ({
    ...option,
    default: settings[option.name],
  }));
  const newSettings = await promptUserSettings({}, schema);

  await saveSettings(newSettings);
}
