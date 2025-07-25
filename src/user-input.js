import { createInterface } from "node:readline";

export function askPrefilledQuestion(prompt, value, validator) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    let inputValue = value || "";

    const askQuestion = () => {
      readline.question(prompt, (input) => {
        inputValue = input.trim();

        if (validator) {
          const validationResult = validator(inputValue);
          if (validationResult !== true) {
            console.log(`\n❌ ${validationResult}\n`);
            return askQuestion();
          }
        }

        readline.close();
        resolve(inputValue);
      });

      readline.write(inputValue);
    };

    askQuestion();
  });
}
