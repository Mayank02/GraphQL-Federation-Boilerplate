import { CustomersRestDataSource } from './services/customers';
import { IDataSources } from './types';

require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires

export function getDataSources(): IDataSources {
  return {
    customersApi: new CustomersRestDataSource(
      process.env.CUSTOMERS_SERVICE_HOST,
    ),
  };
}
