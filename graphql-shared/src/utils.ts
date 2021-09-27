import { IObject } from './commonTypes';
import { HTTPHeaders } from './interfaces/ApiRequest';
import { IProcessEnvCommon } from './commonServerConfig/IProcessEnvCommon';
import { IHttpConfig } from './commonServerConfig/servereConfigTypes';
/**
 * Deep clone/copy an object
 * @todo this will reduce performance
 * Object.assign() does shallow copy
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 * @param obj
 */
export function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export function exists(json: IObject, key: string): boolean {
  const value = json[key];
  return value !== null && value !== undefined;
}

export function sleep(ms): Promise<number> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function str2bool(val: string | undefined | null): boolean {
  return val === undefined || val === null || val === ''
    ? false
    : parseInt(val) > 0;
}

/**
 * Find/extract incoming request headers with only non-blank string values
 * @param {IObject | HTTPHeaders} input
 * @param {string[]} whiteListedKeys - if any
 */
export function extractHeaders(
  input: IObject | HTTPHeaders,
  whiteListedKeys: string[] = [],
): HTTPHeaders {
  const output: HTTPHeaders = {};
  const keyPattern = /^authorization$|^x-.+$|^accept-api-version$/i;
  Object.entries(input).forEach(([k, v]) => {
    const ks = String(k);
    const vs = String(v);
    if (
      ks.trim() !== '' &&
      vs.trim() !== '' &&
      (keyPattern.test(ks) || whiteListedKeys.includes(ks))
    ) {
      output[ks] = vs;
    }
  });
  return output;
}

export function getHttpConfig(penv: IProcessEnvCommon): IHttpConfig {
  return {
    port: Number.parseInt(penv.HTTP_PORT, 10),
    agent: {
      proxy: {
        http: penv.http_proxy || penv.HTTP_PROXY || undefined,
        https: penv.https_proxy || penv.HTTPS_PROXY || undefined,
        noProxy: penv.NO_PROXY || undefined,
      },
    },
  };
}

export function findPathByKeyInObject(object: Object, keyToFind: string) {
  let path = [];

  (function getPathFromObject(object) {
    let entries = Object.entries(object);

    for (const [key, value] of entries) {
      if (typeof object[key] == 'object') {
        if (object[key].hasOwnProperty(keyToFind)) {
          path.push(key);
          path.push(keyToFind);
        } else {
          path.push(key);
          getPathFromObject(object[key]);
          path.pop();
        }
      }
    }
  })(object);

  path.push(keyToFind);

  return path;
}

export function shallowClone(object: unknown): unknown {
  return Object.assign({}, object);
}

export function resolveValueByPath(object, path) {
  return path.reduce((prevValue, currentValue) => {
    return prevValue && prevValue[currentValue];
  }, object);
}

export function isStrValidDate(str: string): boolean {
  switch (true) {
    case isNaN(Date.parse(str)):
    case Date.parse(str).toString() == 'Invalid Date':
    case new Date(str).toISOString() == 'RangeError: invalid date':
      return false;
    default:
      return true;
  }
}

export function getDomainFromUrl(url: string): string {
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches && matches[0];
}
