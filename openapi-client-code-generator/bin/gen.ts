/*
SAMPLE:
node -r ./bin/tshook.js ./bin/gen.ts -l 1 -i ./examples/OpenAPI-v3/accounts.yaml -o ./examples/accounts2.ts -n Accounts -c accounts
*/

import { createCommand } from 'commander';
import fs from 'fs';
import path from 'path';
import jsyaml from 'js-yaml';
import { ApolloRestDataSourceGeneratorV2, setLogLevel } from '../src/ApolloRestDataSourceGeneratorV2';

const program = createCommand();
program.version('1.0.0');

program
  .option('-l, --log-level <level>', 'log level 0: error, 1: warning, 2: info, 3: debug', '0')
  .option('-i, --input <file>', 'input file (openapi v3 spec)')
  .option('-o, --output <file>', 'destination file (apollo rest data source)')
  .option('-n, --service-name <name>', 'service name is used as prefix for apollo class name e.g. Accounts', 'Api')
  .option('-c, --service-config-key <key>', 'service config key used by apollo class e.g. accounts', 'api')
;

program.parse(process.argv);
const rawOptions: CommandOptions = (program.opts()) as CommandOptions; // pretend
(async () => {
  console.log('generate code with options', rawOptions);
  await run(rawOptions);
  console.log('the end.');
})();

async function run(options: CommandOptions) {
  if (!options.input) { console.error('input file is required'); return; }
  if (!options.output) { console.error('output file is required'); return; }
  if (!options.serviceName) { console.error('service name is required'); return; }
  if (!options.serviceConfigKey) { console.error('service config key is required'); return; }

  setLogLevel(Number.parseInt(options.logLevel ?? '0'));

  const inputFilePath = path.resolve(options.input);
  const inputText     = fs.readFileSync(inputFilePath);
  const rawApi        = jsyaml.load(inputText.toString());
  const generator     = new ApolloRestDataSourceGeneratorV2(
    options.serviceName,
    options.serviceConfigKey,
    rawApi,
  );
  const outputText     = generator.generate();
  const outputFilePath = path.resolve(options.output);
  const result         = fs.writeFileSync(outputFilePath, Buffer.from(outputText));
}

interface CommandOptions extends Record<string, string | undefined | null> {
  logLevel?: string;
  input?: string;
  output?: string;
  serviceName?: string;
  serviceConfigKey?: string;
}
