const { PageBuilder } = require('../src/PageBuilder');
const penv = require('./helpers/envConfig').setProcessEnv();

describe('PageBuilder tests', () => {
  const pageSource = [
    {
      item: { value: 1 },
    },
    {
      item: { value: 2 },
    },
    {
      item: { value: 3 },
    },
    {
      item: { value: 4 },
    },
    {
      item: { value: 5 },
    },
  ];

  function getSourceForCursor(pageItem) {
    return pageItem.item.value + '';
  }
  test('should pass validation for offset>=0 and limit>1', () => {
    const paginationInfo = {
      offset: 0,
      limit: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.validateInput();

    expect(result.isInputValidated).toEqual(true);
  });

  test('should throw an error if called with limit 0', () => {
    const paginationInfo = {
      offset: 0,
      limit: 0,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should throw an error if called with limit < 0', () => {
    const paginationInfo = {
      offset: 0,
      limit: -1,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should throw an error if called with offset < 0', () => {
    const paginationInfo = {
      offset: -1,
      limit: 1,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should return empty pageData if called with offset >= pageSource.length', () => {
    const paginationInfo = {
      offset: 5,
      limit: 1,
    };

    const page = new PageBuilder(paginationInfo).getPage(pageSource);

    expect(page.pageData.length).toEqual(0);
  });

  test('should return number of items specified in limit if total lenght > offset + limit', () => {
    const paginationInfo = {
      offset: 2,
      limit: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource);

    expect(result).toEqual({
      totalNumber: 5,
      pageData: [
        {
          item: { value: 3 },
        },
        {
          item: { value: 4 },
        },
      ],
    });
  });

  test('should return all remaining items if total lenght < offset + limit', () => {
    const paginationInfo = {
      offset: 4,
      limit: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource);

    expect(result).toEqual({
      totalNumber: 5,
      pageData: [
        {
          item: { value: 5 },
        },
      ],
    });
  });

  test('should throw an error if no cursor pagination info', () => {
    const paginationInfo = {};

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should throw an error if cursor pagination info has wrong mixture', () => {
    let paginationInfo = {
      first: 1,
      last: 1,
    };

    let pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
    paginationInfo = {
      first: 1,
      before: 'random',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );

    paginationInfo = {
      after: 'random',
      before: 'random',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
    paginationInfo = {
      last: 1,
      after: 'random',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
    paginationInfo = {
      after: 'random',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );

    paginationInfo = {
      before: 'random',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should throw an error if cursor pagination info has nulls', () => {
    let paginationInfo = {
      first: null,
    };

    let pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
    paginationInfo = {
      last: 2,
      before: null,
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );

    paginationInfo = {
      first: 2,
      after: null,
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
    paginationInfo = {
      last: null,
    };

    pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.validateInput()).toThrow(
      'Wrong pagination data provided',
    );
  });

  test('should pass validation if cursor pagination info is correct', () => {
    let paginationInfo = {
      first: 2,
    };

    let pageBuilder = new PageBuilder(paginationInfo);

    let result = pageBuilder.validateInput();

    expect(result.isInputValidated).toEqual(true);

    paginationInfo = {
      last: 2,
    };

    pageBuilder = new PageBuilder(paginationInfo);

    result = pageBuilder.validateInput();

    expect(result.isInputValidated).toEqual(true);

    paginationInfo = {
      first: 2,
      after: 'MQ==',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    result = pageBuilder.validateInput();

    expect(result.isInputValidated).toEqual(true);

    paginationInfo = {
      last: 2,
      before: 'Mw==',
    };

    pageBuilder = new PageBuilder(paginationInfo);

    result = pageBuilder.validateInput();

    expect(result.isInputValidated).toEqual(true);
  });

  test('should base64 encode provided string for cursor', () => {
    const paginationInfo = {
      offset: 4,
      limit: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);
    const cursor = pageBuilder.encodeCursor('1');

    expect(cursor).toEqual('MQ==');
  });

  test('should return connection object with number of nodes from beggining of the range as specified in argument first', () => {
    const paginationInfo = {
      first: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'MQ==', node: { item: { value: 1 } } },
        { cursor: 'Mg==', node: { item: { value: 2 } } },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: 'MQ==',
        endCursor: 'Mg==',
        totalNumber: 5,
      },
    });
  });

  test('should return connection object with number of nodes as specified in argument first after the node specified in cursor', () => {
    const paginationInfo = {
      first: 2,
      after: 'MQ==',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'Mg==', node: { item: { value: 2 } } },
        { cursor: 'Mw==', node: { item: { value: 3 } } },
      ],
      pageInfo: {
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: 'Mg==',
        endCursor: 'Mw==',
        totalNumber: 5,
      },
    });
  });

  test('should throw error if cursor is not found for forward pagination', () => {
    const paginationInfo = {
      first: 2,
      after: 'random',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.getPage(pageSource, getSourceForCursor)).toThrow(
        'Wrong pagination data provided',
      );
  });


  test('should throw error if cursor is the last element in source for forward pagination', () => {
    const paginationInfo = {
      first: 2,
      after: 'NQ==',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.getPage(pageSource, getSourceForCursor)).toThrow(
        'Wrong pagination data provided',
      );
  });

  test('should return connection object with number of nodes from end of the range as specified in argument last', () => {
    const paginationInfo = {
      last: 2,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'NA==', node: { item: { value: 4 } } },
        { cursor: 'NQ==', node: { item: { value: 5 } } },
      ],
      pageInfo: {
        hasPreviousPage: true,
        hasNextPage: false,
        startCursor: 'NA==',
        endCursor: 'NQ==',
        totalNumber: 5,
      },
    });
  });

  test('should return connection object with all nodes from the range if last is more than number of items available', () => {
    const paginationInfo = {
      last: 6,
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'MQ==', node: { item: { value: 1 } } },
        { cursor: 'Mg==', node: { item: { value: 2 } } },
        { cursor: 'Mw==', node: { item: { value: 3 } } },
        { cursor: 'NA==', node: { item: { value: 4 } } },
        { cursor: 'NQ==', node: { item: { value: 5 } } },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: 'MQ==',
        endCursor: 'NQ==',
        totalNumber: 5,
      },
    });
  });

  test('should return connection object with all nodes from the begining of the range if last is more than number of items available before the cursor', () => {
    const paginationInfo = {
      last: 6,
      before: 'Mw==',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'MQ==', node: { item: { value: 1 } } },
        { cursor: 'Mg==', node: { item: { value: 2 } } },
      ],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: 'MQ==',
        endCursor: 'Mg==',
        totalNumber: 5,
      },
    });
  });

  test('should return connection object with number of nodes as specified in argument last before the node specified in cursor', () => {
    const paginationInfo = {
      last: 2,
      before: 'NQ==',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    const result = pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(result).toEqual({
      edges: [
        { cursor: 'Mw==', node: { item: { value: 3 } } },
        { cursor: 'NA==', node: { item: { value: 4 } } },
      ],
      pageInfo: {
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: 'Mw==',
        endCursor: 'NA==',
        totalNumber: 5,
      },
    });
  });



  test('should throw error if cursor is not found for backwards pagination', () => {
    const paginationInfo = {
      last: 2,
      after: 'random',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.getPage(pageSource, getSourceForCursor)).toThrow(
        'Wrong pagination data provided',
      );
  });

  test('should throw error if cursor is the first element in source for backwards pagination', () => {
    const paginationInfo = {
      last: 2,
      before: 'MQ==',
    };

    const pageBuilder = new PageBuilder(paginationInfo);

    expect(() => pageBuilder.getPage(pageSource, getSourceForCursor)).toThrow(
        'Wrong pagination data provided',
      );
  });

  test('should validate pagination input if not called explicitly', () => {
    const paginationInfo = {
      first: 2,
    };
    
    const pageBuilder = new PageBuilder(paginationInfo);
    const validateInputSpy = jest.spyOn(pageBuilder, 'validateInput');

    pageBuilder.getPage(pageSource, getSourceForCursor);

    expect(validateInputSpy).toBeCalled()
  });

});
