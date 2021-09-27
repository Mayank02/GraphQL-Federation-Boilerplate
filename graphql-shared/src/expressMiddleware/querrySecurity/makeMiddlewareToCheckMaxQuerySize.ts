import { QuerySizeError } from '../../errors';
import { GQL_ERR_QUERY_TOO_LARGE_MSG } from '../../constants';

/**
 * Make Express middleware to check max query size
 * @param maxQuerySize
 */
export function makeMiddlewareToCheckMaxQuerySize(maxQuerySize: number) {
  // assign to express app after bodyParser middleware
  function checkMaxQuerySizeMiddleware(req, res, next) {
    // read GQL query from POST body, GET URL, or it is empty
    const query = req.body?.query || req.query?.query || '';
    if (maxQuerySize < query.length) {
      throw new QuerySizeError(GQL_ERR_QUERY_TOO_LARGE_MSG);
    }
    next();
  }

  return checkMaxQuerySizeMiddleware;
}
