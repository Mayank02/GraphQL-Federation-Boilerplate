/*
For those thinking thwy can do better retry logging please be aware
Hi all, had a dig through RemoteGraphQLDataSource and make-fetch-happen and spending hours on debugging I finally find this:
https://github.com/apollographql/federation/blob/44eebf9d47db76052df4f9edeeb1e42278167615/gateway-js/src/datasources/RemoteGraphQLDataSource.ts#L82
and 
https://github.com/npm/make-fetch-happen#--optsretry (Request method is NOT POST AND)
So even if you manage to pass your own fetcher using @Bhoomikapanwar  trick  it will not retry on ECONNREFUSED
https://github.com/apollographql/federation/issues/193
 **/

import { sleep, getDomainFromUrl, str2bool } from '../utils';
import { IProcessEnvFederation } from './IProcessEnvFederation';
import { IServiceListItem } from './servereConfigTypes';
import { ApolloGateway } from '@apollo/gateway';
import { ManagedGateway } from './ManagedGateway';
import { AuthenticatedDataSource } from './AuthenticatedDataSource';
import loggerWrapper from './LoggerWrapper';
import fetch from 'make-fetch-happen';
import { GQL_SERVICE_URL_KEY_PREFIX } from '../constants';

export class GatewayBuilder {
  protected penv: IProcessEnvFederation;

  private logger = loggerWrapper;

  private schemaLoadAttemptLimit: number;

  private sleepBetweenAttempts: number;

  private serviceList: IServiceListItem[];

  private healthEndpointPath: string;

  constructor(penv: IProcessEnvFederation) {
    this.penv = penv;
  }

  async getGateway(): Promise<ApolloGateway> {
    try {
      if (this.isManagedFederation()) {
        return new ManagedGateway().getManagedGateway();
      } else {
        return this.getUnmanagedGateway();
      }
    } catch (error) {
      this.logger.error('Gateway build failed', error);
      return Promise.reject(new Error('Gateway build failed:' + error));
    }
  }

  async getUnmanagedGateway(): Promise<ApolloGateway> {
    this.schemaLoadAttemptLimit = Number.parseInt(
      this.penv.SCHEMA_LOAD_ATTEMPT_LIMIT || '1',
    );
    this.sleepBetweenAttempts = Number.parseInt(
      this.penv.SLEEP_BETWEEN_ATTEMPTS || '5',
    );
    this.healthEndpointPath = String(this.penv.SERVICE_HEALTH_PATH);
    this.buildServiceList();
    if (this.serviceList.length === 0) {
      this.logger.error(
        'Unmanaged Gateway build failed as service list is empty',
      );
      return Promise.reject(
        new Error('Unmanaged Gateway build failed as service list is empty'),
      );
    }
    if (await this.verifyGQLServicesHealthEndpoints()) {
      this.logger.info('apollo gateway is loading schemas ...');
      return Promise.resolve(
        new ApolloGateway({
          buildService: (serviceConfig) => {
            return new AuthenticatedDataSource(serviceConfig);
          },
          debug: false,
          serviceHealthCheck: false,
          logger: this.logger,
          serviceList: this.serviceList,
        }),
      );
    } else {
      this.logger.error('Schema not loaded');
      return Promise.reject(
        new Error('Unmanaged Gateway build failed as Schema not loaded'),
      );
    }
  }

  async verifyGQLServicesHealthEndpoints(): Promise<boolean> {
    return new Promise((mainResolve, mainReject) => {
      const servicePromise = [];
      this.serviceList.forEach((value) => {
        servicePromise.push(
          new Promise<boolean>((resolve, reject) => {
            this.fetchEndpoint(
              value.url,
              value.name,
              this.schemaLoadAttemptLimit,
              resolve,
              reject,
            );
          }),
        );
      });
      Promise.all(servicePromise)
        .then((values) => {
          const result = values.every((value) => value == true);
          result ? mainResolve(result) : mainReject(result);
        })
        .catch((result) => {
          mainResolve(result);
        });
    });
  }

  async fetchEndpoint(
    url: string,
    name: string,
    tries: number,
    resolve,
    reject,
  ): Promise<void> {
    try {
      await fetch(this.getHealthUrl(url))
        .then(async (response) => {
          if (response.ok) {
            return resolve(true);
          } else if (tries > 0) {
            this.logger.warn(
              `apollo gateway will try again in ${this.sleepBetweenAttempts} seconds ${name}...`,
            );
            await sleep(this.sleepBetweenAttempts * 1000);
            return this.fetchEndpoint(url, name, tries - 1, resolve, reject);
          } else {
            return reject(false);
          }
        })
        .catch(async () => {
          if (tries > 0) {
            this.logger.warn(
              `apollo gateway will try again in ${this.sleepBetweenAttempts} seconds for ${name} ...`,
            );
            await sleep(this.sleepBetweenAttempts * 1000);
            return this.fetchEndpoint(url, name, tries - 1, resolve, reject);
          }
          return reject(false);
        });
    } catch (error) {
      this.logger.error(`Could not reach ${name} service`, error);
      return reject(false);
    }
  }

  getHealthUrl(url: string): string {
    const domain = getDomainFromUrl(url);
    if (domain) {
      return `${domain}${this.healthEndpointPath}`;
    } else {
      this.logger.error(`Could not get domian from ${url} domain=${domain}`);
    }
  }

  isManagedFederation(): boolean {
    if (str2bool(this.penv.IS_MANAGED_GATEWAY) && process.env.APOLLO_KEY) {
      this.logger.info('Running in Managed Federation mode');
      return true;
    } else if (!str2bool(this.penv.IS_MANAGED_GATEWAY)) {
      this.logger.info('Running in service-list federation mode');
      return false;
    } else {
      throw new Error('APOLLO_KEY must be set for managed gateway');
    }
  }

  buildServiceList(): void {
    const keys = Object.keys(process.env).filter(
      (key) => key.indexOf(GQL_SERVICE_URL_KEY_PREFIX) === 0,
    );
    const serviceList: IServiceListItem[] = [];
    keys.forEach((key) => {
      serviceList.push({
        name: key.replace(GQL_SERVICE_URL_KEY_PREFIX, '').toLowerCase(),
        url: process.env[key],
      });
    });
    this.serviceList = serviceList;
  }
}
