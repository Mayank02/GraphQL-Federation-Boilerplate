export const sampleMock = {
  getAccountInfo: [
    {
      pathToMatch: '426655440000',
      allHeadersToMatch: { authorization: 'tokens'},
      response: {
        status: 200,
        json: { status: 'okasdsddddddd', somemessage: 'test message' },
      },
    },
    {
      pathToMatch: '426655440001',
      allHeadersToMatch: { authorization: 'token' },
      response: {
        status: 201,
        json: { somemessage: 'test messages of account ending in 1' },
      },
    },
  ],
  getOtherInfo: [
    {
      pathToMatch: '426655440000',
      allHeadersToMatch: { authorization: 'tokens'},
      response: {
        status: 200,
        json: { status: 'okasdsddddddd', somemessage: 'test other message' },
      },
    },
  ],
};
