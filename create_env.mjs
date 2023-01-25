// Script to create env.stage or env.prod on fly during GitLab CI
// Whenever adding a new environment variable, do the following steps:
//   1. Go to GitLab repo
//   2. Settings -> CI/CD
//   3. Under environent variable sections, create one
//   4. Enter name, suffix with "_STAGE" and "_PRODUCTION" for different environments
//   5. Add the name without suffix in the .env.template
import * as fs from 'fs/promises';

const ENV = import.meta.env['ENV'];
const envFileName = `.env.${ENV}`;
const envSuffix = ENV === 'prod' ? 'PROD' : 'STAGE';

const requiredVariables = await fs
  .readFile('.env.example', 'utf-8')
  .then((content) => content.split('\n'))
  .then((lines) => lines.map((line) => line.trim().slice(0, -1))) // Remove '=' from the end
  .then((variables) => variables.filter((variable) => variable)); // Filter out empty variables

await fs.writeFile(envFileName, '', {flag: 'w'}); // Create an empty env file

requiredVariables.forEach(async (variable) => {
  const variableName = `${variable}_${envSuffix}`;
  console.log(`Processing ${variableName}`);
  const value = import.meta.env[variableName];
  if (!value) {
    console.error(
      `${variableName} not found. Maybe you forgot to add it in GitLab CI settings?`,
    );
    process.exit();
  }
  await fs.writeFile(envFileName, `${variable}=${value}\n`, {flag: 'a'});
});

console.log(`Successfully Prepared ${envFileName}`);
