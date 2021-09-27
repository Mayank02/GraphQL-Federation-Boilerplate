const { PathMaker } = require('../src/PathMaker')
const penv = require('./helpers/envConfig').setProcessEnv()


describe('PathMaker tests', () => {

    test('PathMaker make path test', () => {
        const result = new PathMaker('/products/{product-holding-id}/balances', ['product-holding-id'])

        // const clonedObject = deepClone(testObject)

        expect(result.path).toEqual('/products/{product-holding-id}/balances');
        expect(result.paramKeysRequired[0]).toEqual('product-holding-id');

    });

    test('PathMaker pathParser test', () => {
        const result = PathMaker.pathParser('/products/{product-holding-id}/balances', ['product-holding-id'], {
            'product-holding-id' : 123
        })

        // const clonedObject = deepClone(testObject)

        expect(result).toEqual('/products/123/balances');

    });

});