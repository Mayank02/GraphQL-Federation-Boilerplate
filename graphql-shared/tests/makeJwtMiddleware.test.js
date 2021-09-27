const { NextFunction, Request, Response } = require('express');
const {
  makeJwtMiddleware,
} = require('../src/expressMiddleware/makeJwtMiddleware');

describe('makeErrorMiddleware tests', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction = jest.fn();
  let err;
  const OLD_ENV = process.env;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
    };
    err = {};
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('getJwtMiddleware', () => {
    process.env.JWT_KEY = 'dev';
    const jwtMiddleware = makeJwtMiddleware();

    expect(typeof jwtMiddleware).toEqual('function');
  });

  test('getJwtMiddleware fails without env var', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    try {
      makeJwtMiddleware();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        'message',
        'secret should be set',
      );
    }

    expect(mockExit).toHaveBeenCalledWith(9);
    mockExit.mockRestore();
  });
});
