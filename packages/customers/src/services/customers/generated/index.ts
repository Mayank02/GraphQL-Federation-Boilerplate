/**
 * Customer Service API Spec
 * 
 * generated by ApolloRestDataSourceGenerator at 2021-09-27T12:54:56.090Z
 */

import { IApiRequest, PathMaker, BaseRestDataSource } from '@common-utils/graphql-shared';
export interface ObjectWithNoPropsDefined { [prop: string]: any; }
export interface ObjectWithStringProps    { [prop: string]: string; }



export const PATHS = {
  getCustomerDetails: new PathMaker('/customers/{party-id}', ['party-id']),
};


/**
 * API (version 2.1.0)
 */
export class CustomersRestDataSource extends BaseRestDataSource {

  constructor(
    serviceBaseURL: string,
  ) {
    super(serviceBaseURL);
  }

  async getCustomerDetails(request: GetCustomerDetails_Request): Promise<ReadCustomerAggregatedWrapper> {
    return this.get<ReadCustomerAggregatedWrapper>(request.path(), null, request.options());
  }

}

export interface ReadCustomerWithEnumStrings {
  CustomerId?: string;
  TitleText?: string;
  FirstName?: string;
  MiddleName?: string | null;
  LastName?: string;
  Suffix?: string | null;

  /**
   * format: "date"
   */
  DateOfBirth?: string;
  Gender?: ReadCustomerWithEnumStrings__Gender | null;
}


/**
 * 
 * type: number
 */
export enum ReadCustomerWithEnumStrings__Gender_Required {
  _1 = 1,
  _2 = 2,
  _3 = 3,
  _4 = 4,
}

export const ENUM_DATA_ReadCustomerWithEnumStrings__Gender_Required = [
  { id: "1", label: "Male" },
  { id: "2", label: "Female" },
  { id: "3", label: "Unspecified/Prefer not to say" },
  { id: "4", label: "Non-Binary" },
];


/**
 * articial enum type refers to ref enum -NULLABLE-
 */
export type ReadCustomerWithEnumStrings__Gender = ReadCustomerWithEnumStrings__Gender_Required | null;

export interface ReadCustomerAggregatedWrapper {
  Data?: ReadCustomerAggregatedWrapper__Data;
}


export interface ReadCustomerAggregatedWrapper__Data {
  Customer?: ReadCustomerWithEnumStrings;
}


export interface ErrorData {
  Error?: ErrorData__Error;
}


export type ErrorData__Error = Array<ErrorData__ErrorArrayItem>;

export interface ErrorData__ErrorArrayItem {
  Code?: string;
  ReasonCode?: string;
  Message?: string;
}



export class GetCustomerDetails_Request extends IApiRequest<GetCustomerDetails_RequestPathParams, null, null> {
  protected pathMaker(): PathMaker { return PATHS.getCustomerDetails; }
}


export interface GetCustomerDetails_RequestPathParams extends ObjectWithStringProps {
  "party-id": ParamPartyId;
}


export type ParamPartyId = string;

export type GetCustomerDetails_ResponseBody = ReadCustomerAggregatedWrapper;

