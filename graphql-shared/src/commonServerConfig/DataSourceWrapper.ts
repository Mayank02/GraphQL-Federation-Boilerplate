// // The GraphQL schema
import { DataSources } from "apollo-server-core/dist/graphqlOptions";

export class DataSourceWrapper<Type> {
  protected wrappedDatasuorces: DataSources<Type>;

  constructor(datasuorces: Type) {
    this.wrappedDatasuorces = datasuorces as unknown as DataSources<Type>;
  }

  getWrappedDatasuorces(): DataSources<Type> {
    return this.wrappedDatasuorces;
  }
}
