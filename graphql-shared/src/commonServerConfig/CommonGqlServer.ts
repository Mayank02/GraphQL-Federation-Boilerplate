import express, { Application } from 'express';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { IConfigCommon } from './servereConfigTypes';

export class CommonGqlServer {
  public config: IConfigCommon;

  public server: ApolloServer;

  protected app: Application = express();

  constructor(serverConfig: IConfigCommon) {
    this.config = serverConfig;
    this.configureApolloServer(this.config.apollo);
  }

  async configureApolloServer(
    overrides: ApolloServerExpressConfig,
  ): Promise<void> {
    this.server = new ApolloServer({
      ...overrides,
    });
  }

  setMiddleware(middlewares = []): CommonGqlServer {
    const app = this.app;
    if (middlewares.length > 0) {
      middlewares.forEach((item) => {
        app.use(item);
      });
    }
    return this;
  }

  getAppoloServer(): ApolloServer {
    return this.server;
  }

  getExpressApp(): Application {
    return this.app;
  }

  async start(): Promise<{ server: ApolloServer; app: Application }> {
    const app = this.app;
    const server = this.server;
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' }); // path defaults to '/graphql'
    app.listen(this.config.http.port, () => {
      console.log(
        `🚀 ${this.config.serviceInfo.name} ready at http://localhost:${this.config.http.port}${server.graphqlPath}`,
      );
    });
    return Promise.resolve({ server, app });
  }
}
