const { ServerConfigBuilder } = require('../src/commonServerConfig/ServerConfigBuilder')
const penv = require('./helpers/envConfig').setProcessEnv()



describe('Server config builder tests', () => {
    test('getCommonConfig test', () => {

        const serverConfigBuilder = new ServerConfigBuilder(penv)
        serverConfigBuilder.setAppoloConfig()
        const commonConfig = serverConfigBuilder.getCommonConfig()

        expect(typeof commonConfig).toEqual('object');
        expect(typeof commonConfig.http.port).toEqual('number');
        expect(typeof commonConfig.http.port).toEqual('number');
        expect(typeof commonConfig.apollo.introspection).toEqual('boolean');
        expect(typeof commonConfig.apollo.mocks).toEqual('boolean');
        expect(typeof commonConfig.apollo.mockEntireSchema).toEqual('boolean');
        expect(typeof commonConfig.apollo.logger).toEqual('object');
        expect(typeof commonConfig.apollo.plugins[0]).toEqual('object');
        expect(commonConfig.apollo.plugins.length).toEqual(2);
        expect(typeof commonConfig.apollo.formatError).toEqual('function');

    });

    test('setAppoloConfig override test', () => {

        const serverConfigBuilder = new ServerConfigBuilder(penv)
        serverConfigBuilder.setAppoloConfig({
            playground: false
        })
        const commonConfig = serverConfigBuilder.getCommonConfig()

        expect(commonConfig.apollo.playground).toEqual(false);
    });

    test('getServerHttpConfig test', () => {

        const serverConfigBuilder = new ServerConfigBuilder(penv)
        const serverHttpConfig = serverConfigBuilder.getServerHttpConfig()
        
        expect(typeof serverHttpConfig.port).toEqual('number');
    });

    test('getFormatError return test', () => {

        penv['ERROR_STACK_TRACE_ON']=1

        const serverConfigBuilder = new ServerConfigBuilder(penv)
        const error = serverConfigBuilder.getFormatError({msg:'test msg'})
        
        expect(error.msg).toEqual('test msg');
    });

    test('getFormatError return test', () => {

        penv['ERROR_STACK_TRACE_ON']=0

        const serverConfigBuilder = new ServerConfigBuilder(penv)
        const error = serverConfigBuilder.getFormatError({
            msg:'test msg',
            extensions: {
                exception: {
                    stacktrace: true
                }
            }
        })
        
        expect(error.msg).toEqual('test msg');
    });
});
