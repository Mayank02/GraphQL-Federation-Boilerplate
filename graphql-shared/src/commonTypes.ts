export type Nil = undefined | null;
export type Scalar = string | number;
export interface ISimpleObject {
  [name: string]: Scalar | Nil;
}
export type IFlatObject = Record<string, Scalar | Nil> | ISimpleObject;
export type IObject = Record<string, unknown>;

export type PageForCursor<T> = {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
};

export type PageDataCursor<T> = {
  page: Array<T>;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Edge<T> = {
  cursor: string;
  node: T;
};

export type PageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
  totalNumber: number;
};

export type PageForOffset<T> = {
  pageData: Array<T>;
  totalNumber: number;
};

export type PaginationInput = {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
};

export type OffsetPaginationInput = {
  offset: number;
  limit: number;
};

export enum OrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface OrderConfig<T> {
  arrayToOrder: Array<T>;
  itemFunction: Function;
  order: OrderDirectionEnum;
}

export enum StringFilterOperationsEnum {
  EQ = 'EQ',
  CONTAINS = 'CONTAINS',
}

export enum NumericFilterOperationsEnum {
  EQ = 'EQ',
  LE = 'LE',
  LT = 'LT',
  GE = 'GE',
  GT = 'GT',
}
