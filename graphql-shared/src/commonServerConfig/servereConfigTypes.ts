import winston from 'winston';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { PluginDefinition } from 'apollo-server-core';

export type ILogger = winston.Logger;

export interface IHttpAgentConfig {
  proxy: {
    http?: string;
    https?: string;
    noProxy?: string;
  };
}

export interface IHttpConfig {
  port: number;
  agent: IHttpAgentConfig;
}

export interface IServiceInfo {
  name?: string;
  version?: string;
}

export interface IConfigCommon {
  serviceInfo: IServiceInfo;
  http: IHttpConfig;
  apollo: ApolloServerExpressConfig;
  logger?: ILogger;
}
export interface IServiceListItem {
  name: string;
  url: string;
}

export interface IPluginDefinitions {
  pluginOverrides?: PluginDefinition[];
  defaultPluginOptions?: IDefaultPluginOptions;
}

export interface IDefaultPluginOptions {
  loggingPlugin?: ILoggingPluginOptions;
}

export interface ILoggingPluginOptions {
  headersToLog?: string[];
}
