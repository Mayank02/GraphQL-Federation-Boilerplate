// require this file when running mocha command
// we are avoiding 'cd tests && mocha ...'
// dotenv.config does not find .env files in folder tests; so config would be incorrect
require('ts-node').register({
  project: "./bin/tsconfig.json",
});
