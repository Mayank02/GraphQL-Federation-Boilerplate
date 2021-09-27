import winston from 'winston';
import { LOG_LEVEL } from '../constants';

require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires

const loggerWrapper = winston.createLogger({
  level: process.env.LOG_LEVEL || LOG_LEVEL.ERROR,
  transports: [new winston.transports.Console()],
});

export default loggerWrapper;
