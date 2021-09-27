const { AuthenticatedDataSource } = require('../src/commonServerConfig/AuthenticatedDataSource')
const { getHttpConfig } = require('../src/utils')
const penv = require('./helpers/envConfig').setProcessEnv()


describe('AuthenticatedDataSource tests', () => {

    let request;
    let context

    beforeEach(() => {
        request = {
            http:{
                headers: {
                    set: jest.fn()
                }
            }
        };
        context = { headers:{auth:'Bearer'}, user : 'testUser'}
    });

    test('getAgent test', () => {

        const authenticatedDataSource = new AuthenticatedDataSource('http://test.base')
        authenticatedDataSource.willSendRequest({ request , context })

        expect(request.http.headers.set).toBeCalledWith('user', JSON.stringify('testUser'));

    });

});