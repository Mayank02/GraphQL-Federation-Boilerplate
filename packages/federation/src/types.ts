import {
  IConfigCommon,
  ILogger,
  IProcessEnvCommon,
} from '@common-utils/graphql-shared';

export interface IContext {
  headers: NodeJS.Dict<string | string[]>;
  config?: IConfig;
  user: User;
}

export interface IServiceListItem {
  name: string;
  url: string;
}

export interface IConfigApolloGateway {
  serviceList: IServiceListItem[];
  debug?: boolean;
  serviceHealthCheck?: boolean;
  logger?: ILogger;
}

export interface IConfig extends IConfigCommon {
  auth: {
    authHeaderRequired: boolean;
  };
  security: {
    maxQuerySize: number;
    maxQueryDepth: number;
    maxQueryComplexityCost: number;
  };
}

export interface IProcessEnv extends IProcessEnvCommon {
  /**
   * Prefix for other env settings
   * Set it to ''
   * @see https://github.com/gajus/global-agent
   */
  GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE?: string;

  /**
   * Flag to avoid basic security checks e.g. 'authorization' header
   */
  AUTH_HEADER_REQUIRED?: string;

  SCHEMA_LOAD_ATTEMPT_LIMIT?: string;

  SLEEP_BETWEEN_ATTEMPTS?: string;

  /**
   * Maximum character size allowed for a GraphQL query
   * @example '1024' for a 1KB limit
   */
  GQL_MAX_QUERY_SIZE?: string;

  /**
   * Maximum depth allowed for a GraphQL query
   * @example '10'
   * @see https://github.com/stems/graphql-depth-limit
   */
  GQL_MAX_QUERY_DEPTH?: string;

  /**
   * Maximum complexity cost allowed for a GraphQL query
   * @example '1000'
   */
  GQL_MAX_QUERY_COMPLEXITY_COST?: string;
}
/* eslint-disable @typescript-eslint/naming-convention  */
/* eslint-disable @typescript-eslint/no-empty-interface */
interface User {}
declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}
