import { AuthenticationError } from 'apollo-server';
import { ApolloError } from 'apollo-server';
import { UserInputError } from 'apollo-server-errors';
export class QuerySizeError extends Error {
  name: 'QuerySizeError' = 'QuerySizeError';
}

export function buildError<T = string>(
  error: string | Error,
  code?: string,
): T {
  if (typeof error === 'string' && typeof code === 'string') {
    throw new ApolloError(error, code);
  }
  if (typeof error === 'string') {
    throw new ApolloError(error);
  } else {
    throw error;
  }
}

export function buildAuthenticationError<T = string>(message: string): T {
  throw new AuthenticationError(message);
}

export function buildUserInputError<T = string>(message: string): T {
  throw new UserInputError(message);
}
