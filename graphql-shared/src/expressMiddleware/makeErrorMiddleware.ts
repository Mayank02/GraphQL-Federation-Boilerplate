import { IConfigCommon } from '../commonServerConfig/servereConfigTypes';
import logger from '../commonServerConfig/LoggerWrapper';
import { GQL_ERR_QUERY_TOO_LARGE_MSG } from '../constants';

const knownErrors = [GQL_ERR_QUERY_TOO_LARGE_MSG];

export function makeErrorMiddleware(config: IConfigCommon) {
  // assign to express app as last middleware
  function errorMiddleware(err, req, res, next) {
    logger.error(`Error in ${config.serviceInfo.name}`, err.message);
    if (knownErrors.includes(err.message)) {
      // special case
      res.status(400);
      res.json({ error: err.message });
    } else if (err.status && err.status === 401) {
      res.status(err.status);
      res.json({
        errors: [
          {
            message: 'Not Authorised!',
            extensions: {
              code: err.code,
              exception: { reason: err.message },
            },
          },
        ],
        data: null,
      });
    } else {
      logger.error(err?.stack);
      res.status(500);
      res.json({ error: 'Internal Server Error' });
    }
  }

  return errorMiddleware;
}
