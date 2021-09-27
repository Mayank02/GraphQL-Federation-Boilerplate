const { deepClone,
    exists,
    sleep,
    str2bool,
    extractHeaders,
    getHttpConfig,
    findPathByKeyInObject,
    resolveValueByPath
} = require('../src/utils')
const penv = require('./helpers/envConfig').setProcessEnv()


describe('utils tests', () => {

    test('deepClone test', () => {
        const testObject = { url: 'http://test.base' }

        const clonedObject = deepClone(testObject)

        expect(testObject == clonedObject).toEqual(false);

    });

    test('exists test', () => {

        const testObject = { url: 'http://test.base' }

        const resultTrue = exists(testObject, 'url')

        expect(resultTrue).toEqual(true);

        const resultFalse = exists(testObject, 'test')

        expect(resultFalse).toEqual(false);

    });

    test('sleep test', () => {

        const timeoutID = sleep(3)

        // expect(request.http.headers.set).toEqual();

    });


    test('str2bool test', () => {

        const resultUndefined = str2bool('')

        expect(typeof resultUndefined).toEqual('boolean');
        expect(true == resultUndefined).toEqual(false);

        const resultFalse = str2bool(0)

        expect(typeof resultFalse).toEqual('boolean');
        expect(true == resultFalse).toEqual(false);

        const resultTrue = str2bool(1)

        expect(typeof resultTrue).toEqual('boolean');
        expect(true == resultTrue).toEqual(true);

    });

    test('extractHeaders test', () => {
        const headers = {
            authorization: '  Bearer Asasasaslh7868768a7d ',
            'accept-api-version': ' 1.0.1'
        };

        const result = extractHeaders(headers, ['authorization'])

        expect(headers.authorization == result.authorization).toEqual(true);


    });

    test('getHttpConfig test', () => {

        const httpConfig = new getHttpConfig(penv)

        expect(typeof httpConfig.port).toEqual('number');

    });

    test('findPathByKeyInObject test', () => {


        const testObject = {
            productGroupType: 'CURRENT',
            productHoldingShortName: 'My Current Account',
            externalProductHoldingId: '60000143211234',
            status: 'OPEN',
            productHoldingCloseDate: '2021-01-01T00:00:00.000z',
            productHoldingOpenDate: '2020-02-01T00:00:00.000z',
            someItem: {
                itemone: {
                    items: '0134822725asd',
                }
            },
            someItems: {
                itemTwo: {
                    productHoldingId: '0134822725',
                }
            }
        };

        const path = findPathByKeyInObject(testObject, 'productHoldingId')
        const result = resolveValueByPath(testObject, path)

        expect(result).toEqual('0134822725')

       
    });

});