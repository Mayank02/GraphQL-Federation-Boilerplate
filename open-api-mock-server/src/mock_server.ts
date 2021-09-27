require('dotenv').config();

import 'source-map-support/register';
import express from 'express';

import { createMockServer } from './createMockServer';
import fs from 'fs';
import path from 'path';

import proxy from 'express-http-proxy';
import * as swaggerui from 'swagger-ui-express';
import { Server } from 'http';
import { logger } from './logger';

const startRESTPort = Number(process.env.REST_START_PORT) || 9001;
const port = +(process.env.HTTP_PORT || 80);
const scheme = process.env.HTTP_SCHEME || 'https';

const configsFolder = 'configs';

const basePath = String(process.env.BASE_PATH || '').trim();

export const compiledapp = express();
compiledapp.use(logger);
compiledapp.use(express.json());

compiledapp.use(express.static('./configs')); // Makes all the contents of `/configs` accessible from the server - used for swagger access.

function getFolders(within: string): string[] {
  return fs
    .readdirSync(within)
    .filter((f) => !fs.lstatSync(path.join(within, f)).isFile()); // Filter out all files from the configs folder
}
let logOutputs: { [key: string]: any }[] = [];

const serviceFolders = getFolders(configsFolder);

function swaggerURLs(): { name: string; url: string }[] {
  let resultURLs: { name: string; url: string }[] = [];
  serviceFolders.forEach((openapi) => {
    const swaggerURL = getFolders(path.join(configsFolder, openapi)).map(
      (version) => ({
        name: openapi + '-' + version,
        url: `/${path.join(openapi, version, 'spec.yaml')}`,
      })
    );
    resultURLs = resultURLs.concat(swaggerURL);
  });
  return resultURLs;
}

let childServicePort = startRESTPort;

serviceFolders.forEach((serviceFolder) => {
  const servicePath = path.join(configsFolder, serviceFolder);
  const versionFolders = getFolders(servicePath);

  versionFolders.forEach((serviceFolderSubversion) => {
    const versionedServicePath = path.join(
      servicePath,
      serviceFolderSubversion
    );

    const servicePort = childServicePort++;

    const specPath = path.join(versionedServicePath, 'spec.yaml');
    const mockPath = path.join(versionedServicePath, 'mocks.yaml');
    createMockServer(specPath, mockPath, servicePort);
    logOutputs.push({
      spec: specPath,
      mocks: mockPath,
      url: `http://localhost:${servicePort}`,
    });

    compiledapp.use(
      basePath + '/' + serviceFolder + '/' + serviceFolderSubversion,
      proxy(`localhost:${servicePort}`)
    );
  });
});
console.table(logOutputs, ['spec', 'mocks', 'url']);

var swaggerUIOptions: swaggerui.SwaggerUiOptions = {
  explorer: true,
  swaggerOptions: { urls: swaggerURLs() },
  customSiteTitle: 'Mock REST API Server',
};

compiledapp.use(
  basePath + '/swagger',
  swaggerui.serve,
  swaggerui.setup(undefined, swaggerUIOptions)
);

compiledapp.get(basePath + '/health', (req, res) => res.json({ status: 'pass' }));

export function savedListenCallBack(callBack: () => void) {
  console.log('saving callback');
  callBack();
}

let server: Server;

export function startServer(callBack?: () => void) {
  server = compiledapp.listen(port, () => {
    console.info(
      `\nAll services available at ${scheme}://localhost:${port}${basePath}/{service}/{version}/{open-api-path}`
    );
    console.info(
      `Swagger for all services available at ${scheme}://localhost:${port}${basePath}/swagger`
    );

    if (callBack) {
      callBack();
    }
  });
}

export function stopServer(callBack: (err?: Error) => void) {
  server.close(callBack);
}
