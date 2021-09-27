import { RequestInit, BodyInit, URLSearchParamsInit } from 'apollo-server-env';
import { v4 as newUuid } from 'uuid';
import qs from 'qs';

import { IFlatObject, IObject } from '../commonTypes';
import { PathMaker } from '../PathMaker';
import {
  GQL_REQUEST_ID_KEY,
  CONTENT_TYPE_KEY,
  CONTENT_TYPE_JSON,
  ACCEPT_KEY,
  ACCEPT_JSON,
} from '../constants';
/**
 * By defining a template for API request class, we are enforcing a certain structure but also enabling some extension logic
 */
export interface ObjectWithStringProps {
  [name: string]: string;
}

export type HTTPHeaders = ObjectWithStringProps; // not HeadersInit because it is Headers(class) | string[][] | { [name: string]: string }

type HTTPQuery = URLSearchParamsInit;

type HTTPBody = BodyInit | IObject; // TODO: remove IObject

export class IApiRequest<
  TPathParams = ObjectWithStringProps,
  TQuery = IFlatObject,
  TBody = HTTPBody,
  THeaderParams = HTTPHeaders
> {
  protected _pathParams: ObjectWithStringProps;

  protected _query: HTTPQuery = '';

  protected _headers: HTTPHeaders = {};

  protected _body: HTTPBody;

  constructor({
    pathParams,
    query,
    headers,
    body,
  }: {
    pathParams?: TPathParams;
    query?: TQuery;
    headers?: THeaderParams;
    body?: TBody;
  } = {}) {
    if (pathParams) {
      this._pathParams = this.convertPathParams(pathParams);
    }
    if (query) {
      this._query = this.convertQuery(query);
    }
    if (headers) {
      this._headers = this.convertHeaders(headers);
    }
    const id = newUuid();
    this._headers[GQL_REQUEST_ID_KEY] = id;
    console.debug(`${this.constructor.name}.id: ${id}`);
    if (this.isJson()) {
      this._headers[CONTENT_TYPE_KEY] = CONTENT_TYPE_JSON;
      this._headers[ACCEPT_KEY] = ACCEPT_JSON;
    }
    if (body) {
      this._body = this.convertBody(body);
    }
    this.checkBody();
    this.init();
  }

  init(): void {
    // override and do something
  }

  pathParams(): IFlatObject {
    return this._pathParams;
  }

  protected pathMaker(): PathMaker {
    return new PathMaker('');
  }

  path(): string {
    return this.pathMaker().value(this._pathParams);
  }

  params(): HTTPQuery {
    return this._query;
  }

  body(): HTTPBody {
    return this._body;
  }

  protected isJson(): boolean {
    return false;
  }

  id(): string {
    return this._headers[GQL_REQUEST_ID_KEY] || '';
  }

  protected checkBody(): void {
    if (this.isJson() && !this._body) {
      throw new Error('Request body required');
    }
  }

  options(overrides = {}): RequestInit {
    return {
      timeout: 15 * 1000, // TODO: use an env setting for HTTP request timeout
      headers: this._headers,
      ...overrides,
    };
  }

  /**
   * override and convert body input
   * @param body
   * @protected
   */
  protected convertBody(body: TBody): HTTPBody {
    if (this.isJson() && typeof body !== 'string') {
      return JSON.stringify(body);
    }
    // do not touch anything else
    return body as HTTPBody;
  }

  protected convertQuery(query: TQuery): HTTPQuery {
    return qs.stringify(query as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  protected convertPathParams(params: TPathParams): ObjectWithStringProps {
    const result: ObjectWithStringProps = {};
    Object.getOwnPropertyNames(params).forEach((k) => (result[k] = params[k]));
    return result;
  }

  protected convertHeaders(params: THeaderParams): HTTPHeaders {
    const result: HTTPHeaders = {};
    Object.getOwnPropertyNames(params).forEach((k) => (result[k] = params[k]));
    return result;
  }
}
