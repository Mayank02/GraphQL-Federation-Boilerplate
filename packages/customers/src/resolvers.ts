import { Resolvers } from './generated/schema_types';
import { resolvers as cusResolvers } from './services/customers/resolvers';

export const resolvers: Resolvers[] = [cusResolvers];
