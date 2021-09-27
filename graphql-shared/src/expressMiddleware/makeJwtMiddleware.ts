import expressJwt from 'express-jwt';
import logger from '../commonServerConfig/LoggerWrapper';

export function makeJwtMiddleware(
  authHeaderRequired: boolean,
  healthPath = '/.well-known/apollo/server-health',
) {
  const jwtSecretKey: string = process.env?.JWT_KEY;
  if (!jwtSecretKey) {
    logger.error(
      'Error in makeJwtMiddleware: The "JWT_KEY" environment variable is required',
    );
    process.exit(9);
  }
  return expressJwt({
    secret: jwtSecretKey,
    algorithms: ['HS256'],
    credentialsRequired: authHeaderRequired,
  }).unless({ path: [healthPath] });
}
