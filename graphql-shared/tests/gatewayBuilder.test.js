const { GatewayBuilder } = require('../src/commonServerConfig/GatewayBuilder');
const penv = require('./helpers/envConfig').setProcessEnv();

describe('GatewayBuilder tests', () => {
  const OLD_ENV = penv;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  test('create gateway failed to load schema test', () => {
    jest.setTimeout(30000);
    expect.assertions(1);
    return expect(new GatewayBuilder(penv).getGateway()).rejects.toEqual(
      new Error('Unmanaged Gateway build failed as Schema not loaded'),
    );
  });

  test('create gateway failed to build service list test', () => {
    jest.setTimeout(30000);
    delete process.env.GQL_SERVICE_URL_ACCOUNTS;

    expect.assertions(1);
    return expect(new GatewayBuilder(penv).getGateway()).rejects.toEqual(
      new Error('Unmanaged Gateway build failed as service list is empty'),
    );
  });

  test('create gateway failed to load schema with invalid url test', () => {
    jest.setTimeout(30000);
    process.env.GQL_SERVICE_URL_ACCOUNTS = 'http://localhost:140011/graphql';

    expect.assertions(1);
    return expect(new GatewayBuilder(penv).getGateway()).rejects.toEqual(
      new Error('Unmanaged Gateway build failed as Schema not loaded'),
    );
  });

  test('create managed gateway failed with no API key', () => {
    jest.setTimeout(30000);
    penv.IS_MANAGED_GATEWAY = 1;

    expect.assertions(1);
    return expect(new GatewayBuilder(penv).getGateway()).rejects.toEqual(
      new Error(
        'Gateway build failed:Error: APOLLO_KEY must be set for managed gateway',
      ),
    );
  });
});
