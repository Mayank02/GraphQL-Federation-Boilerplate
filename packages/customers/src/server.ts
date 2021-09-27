import express from 'express';
import { getGeneratedSchema } from './schema';
import { getDataSources } from './dataSources';
import { getContext } from './context';
import { apolloMocks } from './apolloMocks/mocks';
import {
  healthCheck,
  ServerConfigBuilder,
  CommonGqlServer,
  makeErrorMiddleware,
  str2bool,
  IProcessEnvCommon,
  DataSourceWrapper,
} from '@common-utils/graphql-shared';
import { IDataSources } from './types';
require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires

const router = express.Router();
router.get('/health', healthCheck);
router.post('/health', healthCheck);

const penv: IProcessEnvCommon = process.env;

const serverConfig = new ServerConfigBuilder(penv)
  .setAppoloConfig({
    schema: getGeneratedSchema(),
    dataSources: () =>
      new DataSourceWrapper<IDataSources>(
        getDataSources(),
      ).getWrappedDatasuorces(),
    context: getContext(),
    mocks: str2bool(penv.APOLLO_MOCKS) ? apolloMocks : false,
    mockEntireSchema: str2bool(penv.APOLLO_MOCK_ENTIRE_SCHEMA),
  })
  .getCommonConfig();

new CommonGqlServer(serverConfig)
  .setMiddleware([router, express.json(), makeErrorMiddleware(serverConfig)])
  .start();
