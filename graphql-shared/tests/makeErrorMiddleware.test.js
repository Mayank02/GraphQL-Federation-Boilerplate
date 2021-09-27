
const { NextFunction, Request, Response }= require('express');
const { makeErrorMiddleware } = require('../src/expressMiddleware/makeErrorMiddleware')
const { GQL_ERR_QUERY_TOO_LARGE_MSG } = require('../src/constants');



describe('makeErrorMiddleware tests', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();
    let err

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn()
        };
        err = {}
    });

    test('getErrorMiddleware', () => {

        const errorMiddleware = makeErrorMiddleware()

        expect(typeof errorMiddleware).toEqual('function');

    });

    test('getErrorMiddleware known error', () => {

        const errorMiddleware = makeErrorMiddleware({serviceInfo:'test'})
        err['message'] = GQL_ERR_QUERY_TOO_LARGE_MSG
        errorMiddleware(err, mockRequest, mockResponse, nextFunction)

        expect(mockResponse.json).toBeCalledWith({ error: GQL_ERR_QUERY_TOO_LARGE_MSG });
        expect(mockResponse.status).toBeCalledWith(400);

    });

    test('getErrorMiddleware not known error known status', () => {

        const errorMiddleware = makeErrorMiddleware({serviceInfo:'test'})
        err['message'] = 'test'
        err['status'] = 401
        err['code'] = 401
        errorMiddleware(err, mockRequest, mockResponse, nextFunction)

        expect(mockResponse.json).toBeCalledWith(
            {
                errors: [
                  {
                    message: 'Not Authorised!',
                    extensions: {
                      code: err.code,
                      exception: { reason: err.message },
                    },
                  },
                ],
                data: null,
              }
        );
        expect(mockResponse.status).toBeCalledWith(401);

    });

    test('getErrorMiddleware not known error', () => {

        const errorMiddleware = makeErrorMiddleware({serviceInfo:'test'})
        err['message'] = test
        errorMiddleware(err, mockRequest, mockResponse, nextFunction)

        expect(mockResponse.json).toBeCalledWith({ error: 'Internal Server Error' });
        expect(mockResponse.status).toBeCalledWith(500);

    });
});