import { str2bool, deepClone, getHttpConfig } from '../utils';
import { IProcessEnvCommon } from './IProcessEnvCommon';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import {
  IServiceInfo,
  IHttpConfig,
  IConfigCommon,
  ILogger,
  IPluginDefinitions,
  ILoggingPluginOptions,
} from './servereConfigTypes';
import { LoggingPlugin } from './LoggingPlugin';
import loggerWrapper from './LoggerWrapper';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
  PluginDefinition,
} from 'apollo-server-core';

export class ServerConfigBuilder {
  protected serviceInfo: IServiceInfo;

  protected apollo: ApolloServerExpressConfig;

  protected http: IHttpConfig;

  protected logger: ILogger = loggerWrapper;

  protected stackTraceVisibility: {
    showStackTrace: boolean;
  };

  protected penv: IProcessEnvCommon;

  constructor(penv: IProcessEnvCommon) {
    this.penv = penv;
    this.setServiceInfo();
    this.setHttpConfig(this.penv);
    this.setStackTraceVisibility(this.penv);
  }

  setServiceInfo(): void {
    const readServiceInfo: IServiceInfo = JSON.parse(
      String(this.penv.SERVICE_INFO),
    ) as IServiceInfo;
    this.serviceInfo = readServiceInfo;
  }

  setAppoloConfig(
    overrides: ApolloServerExpressConfig = {},
    pluginOptions: IPluginDefinitions = { pluginOverrides: [] },
  ): ServerConfigBuilder {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.apollo = {
      introspection: str2bool(self.penv.APOLLO_INTROSPECTION),
      mocks: str2bool(self.penv.APOLLO_MOCKS),
      mockEntireSchema: str2bool(self.penv.APOLLO_MOCK_ENTIRE_SCHEMA),
      debug: str2bool(self.penv.APOLLO_DEBUG),
      logger: {
        debug(message?: any) {
          self.logger.debug(message || '');
        },
        info(message?: any) {
          self.logger.info(message || '');
        },
        warn(message?: any) {
          self.logger.warn(message || '');
        },
        error(message?: any) {
          self.logger.error(message || '');
        },
      },
      plugins: self.getPlugins(pluginOptions),
      formatError: (err) => this.getFormatError(err),
      ...overrides,
    };
    return this;
  }

  getPlugins(pluginOptions: IPluginDefinitions): PluginDefinition[] {
    return [
      this.getLoggingPlugin(pluginOptions?.defaultPluginOptions?.loggingPlugin),
      this.getApolloPlayground(str2bool(this.penv.APOLLO_PLAYGROUND)),
      ...pluginOptions?.pluginOverrides,
    ];
  }

  getApolloPlayground = (enableApolloPlayground: boolean): PluginDefinition => {
    if (!enableApolloPlayground) {
      return ApolloServerPluginLandingPageDisabled();
    } else {
      return ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          'schema.polling.interval': 200000,
        },
      });
    }
  };

  getLoggingPlugin(pluginOptions: ILoggingPluginOptions): PluginDefinition {
    return new LoggingPlugin(
      this.logger,
      this.serviceInfo,
      pluginOptions?.headersToLog,
    ).getApolloLoggingPlugin();
  }

  getFormatError = (err) => {
    // it is better for performance if we can avoid cloning
    if (
      !this.stackTraceVisibility.showStackTrace &&
      err.extensions?.exception?.stacktrace
    ) {
      const errClone = deepClone(err);
      delete errClone.extensions.exception.stacktrace;
      return errClone;
    }
    return err;
  };

  setHttpConfig(penv: IProcessEnvCommon): void {
    this.http = getHttpConfig(penv);
  }

  getServerHttpConfig(): IHttpConfig {
    return this.http;
  }

  setStackTraceVisibility(penv: IProcessEnvCommon): void {
    this.stackTraceVisibility = {
      showStackTrace: str2bool(penv.ERROR_STACK_TRACE_ON),
    };
  }

  getPenEnv(): IProcessEnvCommon {
    return this.penv;
  }

  getCommonConfig(): IConfigCommon {
    return {
      serviceInfo: this.serviceInfo,
      http: this.http,
      apollo: this.apollo,
      logger: this.logger,
    };
  }
}
