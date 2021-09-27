import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLServerListener,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { shallowClone } from '../utils';
import {
  IServiceInfo,
  ILogger,
} from './servereConfigTypes';
import { LOG_LEVEL, HEADERS } from '../constants';
import { printSchema } from 'graphql';

require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires

export class LoggingPlugin {
  public logger: ILogger;
  public serviceInfo: IServiceInfo;
  public headersToLog: string[] = [
    HEADERS.BRAND,
    HEADERS.CLIENT_IP,
    HEADERS.CORRELATION_ID,
  ];

  public loggerFunc = {
    error: (msg, meta): Promise<boolean> =>
      this.log(LOG_LEVEL.ERROR, msg, meta),
    info: (msg, meta): Promise<boolean> => this.log(LOG_LEVEL.INFO, msg, meta),
    debug: (msg, meta): Promise<boolean> =>
      this.log(LOG_LEVEL.DEBUG, msg, meta),
  };

  constructor(logger: ILogger, serviceInfo: IServiceInfo, headersToLog = ['']) {
    this.logger = logger;
    this.serviceInfo = serviceInfo;
    this.headersToLog = [...this.headersToLog, ...headersToLog];
    this.headersToLog.every((value) => value.toLowerCase());
  }

  getApolloLoggingPlugin(): ApolloServerPlugin {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      async serverWillStart() {
        self.loggerFunc.info('serverWillStart', '');
        return self.serverLifeCycleEvents();
      },
      async requestDidStart(requestContext) {
        const { operationName, query, method, headers, operation } =
          self.getInfoFromRequestContext(requestContext);
        self.loggerFunc.info('requestDidStart', { operationName, headers });
        self.loggerFunc.debug('requestDidStart', {
          operationName,
          headers,
          query,
          operation,
          method,
        });
        return self.requestLifeCycleEvents();
      },
    };
  }

  serverLifeCycleEvents(): GraphQLServerListener {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      schemaDidLoadOrUpdate({ apiSchema, coreSupergraphSdl }) {
        self.loggerFunc.info('Schema did load successfully', '');
        self.loggerFunc.debug('Schema did load: ' + printSchema(apiSchema), '');
        if (coreSupergraphSdl) {
          self.loggerFunc.debug('The core schema is: ' + coreSupergraphSdl, '');
        }
      },
      serverWillStop() {
        self.loggerFunc.info('serverWillStop', '');
        return Promise.resolve();
      },
    };
  }

  requestLifeCycleEvents(): GraphQLRequestListener {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      async parsingDidStart(parsingRequestContext) {
        const { operationName, query, method, headers, operation, variables } =
          self.getInfoFromRequestContext(parsingRequestContext);
        self.loggerFunc.info('parsingDidStart', {
          operationName,
          headers,
          method,
          operation,
        });
        self.loggerFunc.debug('parsingDidStart', { query, variables });
        return async (err) => {
          if (err) self.loggerFunc.error('parsing error', err);
        };
      },
      async validationDidStart(validationRequestContext) {
        const { operationName, query, method, headers, operation, variables } =
          self.getInfoFromRequestContext(validationRequestContext);
        self.loggerFunc.info('validationDidStart', {
          operationName,
          headers,
          method,
          operation,
        });
        self.loggerFunc.debug('didResolveOperation', {
          query,
          variables,
        });
        return async (errors) => {
          if (errors) {
            errors.forEach((err) =>
              self.loggerFunc.error('validation error', err),
            );
          }
        };
      },
      async didResolveOperation(didResolveRequestContext) {
        const { operationName, query, method, headers, operation, variables } =
          self.getInfoFromRequestContext(didResolveRequestContext);
        self.loggerFunc.info('didResolveOperation', {
          operationName,
          headers,
          method,
          operation,
        });
        self.loggerFunc.debug('didResolveOperation', {
          query,
          variables,
        });
      },
      async executionDidStart(executionRequestContext) {
        const { operationName, method, headers, operation } =
          self.getInfoFromRequestContext(executionRequestContext);
        self.loggerFunc.info('parsingDidStart', {
          operationName,
          headers,
          method,
          operation,
        });
        return {
          async executionDidEnd(err) {
            if (err) {
              self.loggerFunc.error('executionDidStart error', err);
            }
          },
        };
      },
      async didEncounterErrors(didErrorsRequestContext) {
        const { operationName, query, method, headers, operation, variables } =
          self.getInfoFromRequestContext(didErrorsRequestContext);
        self.loggerFunc.error('didEncounterErrors', {
          operationName,
          headers,
          method,
          operation,
        });
        self.loggerFunc.debug('didEncounterErrors', {
          query,
          variables,
        });
      },
      async willSendResponse(willSendResponceRequestContext) {
        const { operationName, query, method, headers, operation, variables } =
          self.getInfoFromRequestContext(willSendResponceRequestContext);
        self.loggerFunc.info('willSendResponse', {
          operationName,
          headers,
          method,
          operation,
        });
        self.loggerFunc.debug('willSendResponse', {
          query,
          variables,
        });
      },
    };
  }

  async log(level: LOG_LEVEL, msg: string, meta: any = ''): Promise<boolean> {
    this.logger.log(level, this.wrapMsg(msg), meta);
    return Promise.resolve(true);
  }

  getInfoFromRequestContext(requestContext: GraphQLRequestContext): any {
    const loggingValues = {
      operationName: new String(requestContext.request.operationName),
      query: new String(requestContext.request.query),
      variables: shallowClone(requestContext.request.variables),
      method: new String(requestContext.request.http.method),
      url: new String(requestContext.request.http.url),
      headers: this.prepHeaders(new Map(requestContext.request.http.headers)),
      document: shallowClone(requestContext.document),
      operation: requestContext.operation
        ? new String(requestContext.operation.operation)
        : null,
      responseData: requestContext.response?.data,
    };
    // remove any sensitive info from request before logging
    this.sanitizeLoggingValues(loggingValues);
    return loggingValues;
  }

  prepHeaders(headers: Map<string, string>): Record<string, string> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.sanitizeHeaders(headers);
    const headersObject = {};
    headers.forEach((value, key) => {
      if (self.headersToLog.includes(key.toLowerCase())) {
        headersObject[key] = value;
      }
    });
    return headersObject;
  }

  /*
   * TODO: provide an ability to furtehr sanitize logging output
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  sanitizeLoggingValues(loggingValues) {
    return loggingValues;
  }

  sanitizeHeaders(headers: Map<string, string>): Map<string, string> {
    try {
      headers.delete('authorization');
    } catch (error) {
      this.loggerFunc.error('sanitizeHeaders', error);
    }
    return headers;
  }

  wrapMsg(msg: string): string {
    const time = new Date().toISOString();
    const service = `${this.serviceInfo.name} v${this.serviceInfo.version}`;
    return `${time} (${service}): ${msg}`;
  }
}
