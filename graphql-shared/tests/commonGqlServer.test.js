const { ServerConfigBuilder } = require('../src/commonServerConfig/ServerConfigBuilder')
const { CommonGqlServer } = require('../src/commonServerConfig/CommonGqlServer')
const { ApolloServer, gql } = require('apollo-server-express');
const penv = require('./helpers/envConfig').setProcessEnv()

const typeDefs = gql`
type Book {
    title: String
    author: String
}
type Query {
    books: [Book]
}
`;

const commonServerConfig = new ServerConfigBuilder(penv)
    .setAppoloConfig({
        typeDefs
    })
    .getCommonConfig()

let server = null

afterAll(() => {
    server.then(({ server, app})=>{
        server.stop()
        app.stop()
    })
  });


describe('Server tests', () => {
    test('getAppoloServer test', () => {

        const gqlServer = new CommonGqlServer(commonServerConfig)

        expect(gqlServer.getAppoloServer() instanceof ApolloServer).toEqual(true);

    });

    test('getExpressApp test', () => {

        const gqlServer = new CommonGqlServer(commonServerConfig)

        expect(typeof gqlServer.getExpressApp()).toEqual('function');

    });

    test('setMiddleware test', () => {

        const gqlServer = new CommonGqlServer(commonServerConfig)
        const testMiddleWare = function (req, res, next) {
            return 'msg test'
        }
        gqlServer.setMiddleware([testMiddleWare])

        const app = gqlServer.getExpressApp()

        expect(app._router.stack[2].name).toEqual('testMiddleWare');

    });

    test('start test', () => {

        const gqlServer = new CommonGqlServer(commonServerConfig)
        server = gqlServer.start()

    });
});
