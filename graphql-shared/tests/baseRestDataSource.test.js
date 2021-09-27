const { BaseRestDataSource } = require('../src/BaseRestDataSource')
const { getHttpConfig } = require('../src/utils')
const penv = require('./helpers/envConfig').setProcessEnv()


describe('BaseRestDataSource tests', () => {

    test('getAgent test', () => {

        class TestRestDataSource extends BaseRestDataSource {
            constructor(serviceBaseURL) {
                super(serviceBaseURL);
            }
        }
        const testDataSource = new TestRestDataSource('http://test.base')

        expect(testDataSource.getAgent()).toEqual(false);

    });

    test('getAgent test', () => {

        class TestRestDataSource extends BaseRestDataSource {
            constructor(serviceBaseURL) {
                super(serviceBaseURL);
            }
        }
        penv['HTTPS_PROXY'] = 'http://proxy.example.com:8080'
        const testDataSource = new TestRestDataSource('http://test.base')
        const httpConfig = getHttpConfig(penv)
        const agent = testDataSource.getAgent('http://test.base', httpConfig)

        expect(agent.proxy.href).toEqual('http://proxy.example.com:8080/');

    });

    test('getAgent test', () => {

        class TestRestDataSource extends BaseRestDataSource {
            constructor(serviceBaseURL) {
                super(serviceBaseURL);
            }
        }
        penv.HTTPS_PROXY = 'https://proxy.example.com:8080'
        const httpConfig = getHttpConfig(penv)
        const testDataSource = new TestRestDataSource('https://test.base')
        const agent = testDataSource.getAgent('https://test.base', httpConfig)

        expect(agent.proxy.href).toEqual('https://proxy.example.com:8080/')
        expect(agent.secureProxy).toEqual(true);


    });

});