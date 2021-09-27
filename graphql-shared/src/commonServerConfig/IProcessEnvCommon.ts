import { IServiceInfo } from './servereConfigTypes';

export interface IProcessEnvCommon {
  HTTP_PORT?: string;

  http_proxy?: string;
  HTTP_PROXY?: string;
  https_proxy?: string;
  HTTPS_PROXY?: string;
  NO_PROXY?: string;

  /**
   * Flag for Apollo playground. use 1 to enable
   */
  APOLLO_PLAYGROUND?: string;

  /**
   * Flag for Apollo introspection. use 1 to enable
   */
  APOLLO_INTROSPECTION?: string;

  /**
   * Flag for Apollo mocks. use 1 to enable
   */
  APOLLO_MOCKS?: string;

  /**
   * Flag for Apollo mocks for entire schema. use 1 to enable
   */
  APOLLO_MOCK_ENTIRE_SCHEMA?: string;

  /**
   * Flag for Apollo debug. use 1 to enable
   */
  APOLLO_DEBUG?: string;

  /**
   * Define API gateway host and leave other microservice host parameters blank
   * if microservices are behind a common API gateway
   */
  API_GATEWAY_HOST?: string;

  /**
   * winston log levels:
   *   emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7
   */
  LOG_LEVEL?: string;

  /**
   * Flag to show error stack trace
   */
  ERROR_STACK_TRACE_ON?: string;

  SERVICE_INFO?: IServiceInfo;
}
