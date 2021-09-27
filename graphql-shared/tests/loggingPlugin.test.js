const LoggingPlugin = require('../src/commonServerConfig/LoggingPlugin');
const loggerWrapper = require('../src/commonServerConfig/LoggerWrapper');

describe('loggingPlugin tests', () => {
  let requestContext = {
    request: {
      operationName: 'test',
      query: 'query test',
      variables: { test: 'testvar' },
      http: {
        method: 'GET',
        url: 'testUrl',
        headers: {
          authorization: 'Bearer token',
          testheader: 'testheadervalue',
        },
      },
    },
    response: {
      data: {},
      errors: [],
    },
  };

  test('getLogger test', () => {
    const logger = loggerWrapper.default;

    expect(logger.level).toEqual('error');
  });

  test('prepareLoggingPlugin test', () => {
    const preparedLogPlugin = new LoggingPlugin.LoggingPlugin(
      this.logger,
      {
        name: 'testService',
        version: '0.0.1',
      },
      [],
    ).getApolloLoggingPlugin();

    const result = preparedLogPlugin.requestDidStart(requestContext);
    result.then((promiseResult) => {
      promiseResult.parsingDidStart(requestContext);
      promiseResult.validationDidStart(requestContext);
      promiseResult.executionDidStart();
      promiseResult.didResolveOperation(requestContext);
      promiseResult.didEncounterErrors(requestContext);
      promiseResult.willSendResponse(requestContext);
    });
  });
});
