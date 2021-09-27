import { Request } from "openapi-backend";
import { query } from "jsonpath";

export type MockResponse = {
  headers?: { [key: string]: any };
  status: number;
  json: any;
};

export type MockSpec = {
  pathToMatch: string;
  queryKeyToMatch: string;
  queryValueToMatch: string;
  allHeadersToMatch?: { [key: string]: string };
  bodyJSONPaths?: { path: string; matchRegex: string }[];
  response: MockResponse;
};

type OpenAPIMocks = {
  [key: string]: (c: any, req: Request) => MockResponse;
};

export function createMocks(mockSeed: {
  [key: string]: MockSpec[];
}): OpenAPIMocks {
  let result: OpenAPIMocks = {};

  for (let operationKey in mockSeed) {
    result[operationKey] = (c, req: Request): MockResponse => {
      // console.log('req URL: ', req.path);

      const mocksForOperation = mockSeed[operationKey];
      // MockSpecs should be sorted so that the ones with more stringent requirements are tested first.
      // eg. A spec requiring only a path regex match would match easier than a spec requiring a path AND header AND body match.
      // Therefore the one with more requirements for matching should be checked first and this can ensured by sorting the specs as below.
      let response = mocksForOperation
        .sort((a, b) => {
          var aValue = 0;
          var bValue = 0;
          if (a.allHeadersToMatch)
            aValue += Object.keys(a.allHeadersToMatch).length;
          if (a.bodyJSONPaths) aValue += a.bodyJSONPaths.length;
          if (b.allHeadersToMatch)
            bValue += Object.keys(b.allHeadersToMatch).length;
          if (b.bodyJSONPaths) bValue += b.bodyJSONPaths.length;
          return bValue - aValue;
        })
        .find((mock) => checkMockMatchesRequest(mock, req));
      if (response != null) {
        // console.log(
        //   '-- returning matching mockSpec: ',
        //   JSON.stringify(response, null, 4)
        // );
        return response.response;
      } else {
        return {
          status: 404,
          json: {
            err:
              "No matching response found in mocks for the provided request operation. Check your request against the mocks below:",
            request: {
              path: req.path,
              headers: req.headers,
              body: req.body,
              query: req.query,
            },
            providedMocksForThisOperation: mocksForOperation,
          },
        };
      }
    };
  }
  return result;
}

function containsRegexMatch(
  stringToMatch: string,
  regexString: string
): boolean {
  const matches = stringToMatch.match(RegExp(regexString));
  return matches != null ? matches.length > 0 : false;
}

function checkMockMatchesRequest(mock: MockSpec, req: Request): boolean {
  if (containsRegexMatch(req.path, mock.pathToMatch)) {
    for (let mockHeaderKey in mock.allHeadersToMatch) {
      if (!req.headers || !req.headers[mockHeaderKey]) return false;

      let matchingHeader =
        (req.headers[mockHeaderKey] as string) ||
        (req.headers[mockHeaderKey] as string[])[0];
      if (
        !matchingHeader ||
        !containsRegexMatch(
          matchingHeader,
          mock.allHeadersToMatch[mockHeaderKey]
        )
      ) {
        // console.log(
        //   `failed matched header: '${mockHeaderKey}' with regex: '${mock.allHeadersToMatch[mockHeaderKey]}' against value: '${matchingHeader}'`
        // );

        return false;
      }
      // console.log(
      //   `- matched header: '${mockHeaderKey}' with regex: '${mock.allHeadersToMatch[mockHeaderKey]}' against value: '${matchingHeader}'`
      // );
    }

    if (
      mock.queryKeyToMatch != undefined &&
      mock.queryValueToMatch != undefined
    ) {
      if (
        req.query &&
        req.query[mock.queryKeyToMatch] &&
        containsRegexMatch(
          req.query[mock.queryKeyToMatch],
          mock.queryValueToMatch
        )
      ) {
        return true;
      } else {
        return false;
      }
    }

    for (let jsonQueryPath of mock.bodyJSONPaths || []) {
      if (!req.body) {
        // console.log('failed to match request without body');
        return false;
      }
      const body = req.body || {};

      const queryResults = query(body, jsonQueryPath.path);
      // console.log(
      //   'queryResults' +
      //     JSON.stringify(queryResults) +
      //     queryResults.length +
      //     (typeof queryResults[0] !== 'string')
      // );

      if (
        queryResults.length == 1 &&
        typeof queryResults[0] === "string" &&
        containsRegexMatch(queryResults[0], jsonQueryPath.matchRegex)
      ) {
        // console.log(
        //   'found body match with:' +
        //     queryResults[0] +
        //     ' using regex: ' +
        //     jsonQueryPath.matchRegex
        // );
      } else return false;

      // console.log(
      //   '- matched body with jsonpath:',
      //   req.body,
      //   ' with jsonpath:',
      //   jsonQueryPath
      // );
    }
    // console.log('- matched url path:', req.path);
    return true;
  }
  // console.log('failed match of url path');
  return false;
}
