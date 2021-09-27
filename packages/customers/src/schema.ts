// The GraphQL schema
import path from 'path';
import fs from 'fs';
import { permissions } from './permissions';
import { resolvers } from './resolvers';
import { GraphQLSchema } from 'graphql';
import { SchemaGenerator } from '@common-utils/graphql-shared';

const schemaText = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'));
const generator = new SchemaGenerator(schemaText, permissions, resolvers);

export const typeDefs = generator.getTypeDefs();

export const getGeneratedSchema = (): GraphQLSchema => {
  return generator.getSchema();
};
