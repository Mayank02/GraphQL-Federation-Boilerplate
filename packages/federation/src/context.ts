import { extractHeaders } from '@common-utils/graphql-shared';

export const getContext =
  /* eslint-disable @typescript-eslint/no-explicit-any */

  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */


    (overrides: any = {}) =>
    // operating with Express context as input
    /* istanbul ignore next */
    (
      /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
      { req }, // do not throw authentication error // this blocks Apollo Gateway - it cannot load schemas // instead, we will interrupt requests going out to RESTful microservices
    ) => ({
      /* istanbul ignore next */
      headers: extractHeaders(req?.headers || {}, [
        'app-version',
        'app-name',
        'true-client-ip',
        'platform',
      ]),
      user: req.user || null,
      ...overrides,
    });
