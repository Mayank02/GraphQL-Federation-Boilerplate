import loggerWrapper from './LoggerWrapper';
import { ApolloGateway, GatewayConfig } from '@apollo/gateway';
import { AuthenticatedDataSource } from './AuthenticatedDataSource';
import fetch from 'make-fetch-happen';
export class ManagedGateway {
  getManagedGateway(): Promise<ApolloGateway> {
    try {
      const props = {
        debug: false,
        serviceHealthCheck: false,
        logger: loggerWrapper,
      };

      const fetcherConfig = {
        fetcher: fetch.defaults({
          onRetry() {
            this.logger.info('Retrying fetch:  ' + Date.now());
          },
          retry: {
            retries: 10,
            factor: 3,
            minTimeout: 1 * 1000,
            maxTimeout: 60 * 1000,
            randomize: true,
          },
        }),
      };

      const defaultConfig: GatewayConfig = {
        buildService: (serviceConfig) =>
          new AuthenticatedDataSource(serviceConfig),
      };
      const gateway = new ApolloGateway({
        ...defaultConfig,
        ...props,
        ...fetcherConfig,
      });
      return Promise.resolve(gateway);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
