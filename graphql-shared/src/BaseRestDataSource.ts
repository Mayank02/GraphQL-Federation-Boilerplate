import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import { ValueOrPromise } from 'apollo-server-env';
import { IHttpConfig } from './commonServerConfig/servereConfigTypes';
import { getHttpConfig } from './utils'

const HttpsProxyAgent = require('https-proxy-agent'); // eslint-disable-line @typescript-eslint/no-var-requires
const HttpProxyAgent = require('http-proxy-agent'); // eslint-disable-line @typescript-eslint/no-var-requires

export class BaseRestDataSource extends RESTDataSource {
  httpConfig: IHttpConfig;

  constructor(
    serviceBaseURL: string
  ) {
    super();
    this.baseURL = serviceBaseURL;
    this.httpConfig = getHttpConfig(process.env);
  }

  protected willSendRequest(request: RequestOptions): ValueOrPromise<void> {
    request.agent = this.getAgent(this.baseURL || '', this.httpConfig);
  }




  /**
   * Get HTTP agent
   * @param baseURL
   * @param httpConfig
   */
  protected getAgent(
    baseURL: string,
    httpConfig: IHttpConfig | undefined,
  ): typeof HttpsProxyAgent | typeof HttpProxyAgent | false {
    if (baseURL && httpConfig && httpConfig.agent) {
      const { proxy } = httpConfig.agent;
      const isSecure = baseURL.substring(0, 5).toLowerCase() === 'https';
      if (isSecure) {
        if (proxy.https) {
          return new HttpsProxyAgent(proxy.https);
        }
      } else if (proxy.http) {
        return new HttpProxyAgent(proxy.http);
      }
    }
    return false;
  }
}
