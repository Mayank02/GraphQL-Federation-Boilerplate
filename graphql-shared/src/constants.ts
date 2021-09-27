export const ACCEPT_JSON = 'application/json';
export const ACCEPT_KEY = 'accept';
export const CONTENT_TYPE_JSON = 'application/json; charset=utf-8'; // without charset, it may cause issues
export const CONTENT_TYPE_KEY = 'content-type';
export const GQL_REQUEST_ID_KEY = 'x-gql-request-id';
export const GQL_ERR_QUERY_TOO_LARGE_MSG = 'query too large';
export const DEFAULT_LOG_LEVEL = 'error';
export const GQL_SERVICE_URL_KEY_PREFIX = 'GQL_SERVICE_URL_';

export enum LOG_LEVEL {
  EMERG = 'emerg',
  ALERT = 'alert',
  CRIT = 'crit',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum HEADERS {
  BRAND = 'x-brand',
  CLIENT_IP = 'true-client-ip',
  CORRELATION_ID = 'x-txn-correlation-id',
}
