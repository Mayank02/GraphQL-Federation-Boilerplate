/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { extractHeaders } from '@common-utils/graphql-shared';

export const getContext =
  (overrides: any = {}) =>
  // operating with Express context as input
  (
    { req }, // do not throw authentication error // this blocks Apollo Gateway - it cannot load schemas // instead, we will interrupt requests going out to RESTful microservices
  ) => ({
    headers: extractHeaders(req?.headers || {}, [
      'app-version',
      'app-name',
      'true-client-ip',
      'platform',
    ]),
    user: req.headers.user ? JSON.parse(req.headers.user) : null,
    ...overrides,
  });
