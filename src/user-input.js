import { createInterface } from "node:readline";

export function askPrefilledQuestion(prompt, value) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(prompt, (name) => {
      readline.close();
      resolve(name);
    });
    readline.write(value);
  });
}
