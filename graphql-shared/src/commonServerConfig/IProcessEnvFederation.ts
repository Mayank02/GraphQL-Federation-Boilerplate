import { IProcessEnvCommon } from './IProcessEnvCommon';

export interface IProcessEnvFederation extends IProcessEnvCommon {
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

  IS_MANAGED_GATEWAY?: string;

  SERVICE_HEALTH_PATH?: string;
}
