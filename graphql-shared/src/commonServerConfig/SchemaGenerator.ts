// The GraphQL schema
import { gql } from 'apollo-server';
import { GraphQLResolverMap } from 'apollo-graphql';
import { applyMiddleware, IMiddlewareGenerator } from 'graphql-middleware';
import { buildFederatedSchema } from '@apollo/federation';
import { GraphQLSchema, DocumentNode } from 'graphql';
import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

export class SchemaGenerator {
  protected schema: GraphQLSchema;
  protected typeDefs: DocumentNode;

  constructor(
    schemaText: Buffer,
    permissions: IMiddlewareGenerator<any, any, any>,
    allResolvers: IResolvers[],
  ) {
    this.typeDefs = gql`
      ${schemaText}
    `;
    const typeDefs = this.typeDefs;
    const resolvers = mergeResolvers(allResolvers) as GraphQLResolverMap;
    this.schema = applyMiddleware(
      buildFederatedSchema([{ typeDefs, resolvers }]),
      permissions,
    );
  }

  getSchema(): GraphQLSchema {
    return this.schema;
  }

  getTypeDefs(): DocumentNode {
    return this.typeDefs;
  }
}
