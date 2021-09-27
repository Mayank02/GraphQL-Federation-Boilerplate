import { typeDefs } from '../schema';

export const apolloMocks = {
  _Service: (): { sdl: string } => ({
    sdl: typeDefs?.loc?.source?.body,
  }),
};
