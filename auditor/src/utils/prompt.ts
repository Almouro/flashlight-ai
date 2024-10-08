import readline from "readline";

export async function promptUser(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function question(query: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

  try {
    const name: string = await question(`${prompt}\n`);
    return name;
  } finally {
    rl.close();
  }
}
