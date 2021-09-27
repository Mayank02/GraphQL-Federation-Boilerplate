import graphqlDepthLimit from 'graphql-depth-limit';
import express from 'express';
import { getContext } from './context';
import {
  healthCheck,
  ServerConfigBuilder,
  CommonGqlServer,
  makeErrorMiddleware,
  GatewayBuilder,
  makeMiddlewareToCheckMaxQuerySize,
  makeJwtMiddleware,
  str2bool,
  IProcessEnvCommon,
  loggerWrapper,
} from '@common-utils/graphql-shared';

require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires
const penv: IProcessEnvCommon = process.env;

async function main() {
  const gateway = await new GatewayBuilder(penv)
    .getGateway()
    .then((result) => {
      return result;
    })
    .catch((error: Error) => {
      throw error;
    });

  const serverConfig = new ServerConfigBuilder(penv)
    .setAppoloConfig({
      context: getContext(),
      validationRules: [
        graphqlDepthLimit(process.env.GQL_MAX_QUERY_DEPTH || '10'),
      ],
      gateway,
    })
    .getCommonConfig();

  const router = express.Router();
  router.get('/health', healthCheck);
  router.post('/health', healthCheck);

  new CommonGqlServer(serverConfig)
    .setMiddleware([
      router,
      express.json(),
      makeJwtMiddleware(str2bool(process.env.AUTH_HEADER_REQUIRED)),
      makeMiddlewareToCheckMaxQuerySize(
        Number.parseInt(process.env.GQL_MAX_QUERY_SIZE || '4096'),
      ),
      makeErrorMiddleware(serverConfig),
    ])
    .start();
}
(async () => {
  await main().catch((error: Error) => {
    loggerWrapper.error(error.message);
    process.exit(1);
  });
})();
