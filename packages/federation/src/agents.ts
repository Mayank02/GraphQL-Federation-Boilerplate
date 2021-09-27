// Setup global support for environment variable based proxy configuration.
/* eslint-disable @typescript-eslint/no-var-requires */
const { bootstrap: bootstrapGlobalAgent } = require('global-agent');

bootstrapGlobalAgent();
