import { HTTPHeaders, IConfigCommon } from '@common-utils/graphql-shared';
import { CustomersRestDataSource } from './services/customers';

export interface IDataSources {
  customersApi: CustomersRestDataSource;
}

export interface ICommonContextType {
  dataSources: IDataSources;
  headers?: HTTPHeaders;
  config: IConfigCommon;
  user: User;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface User {
  partyId: string;
}
