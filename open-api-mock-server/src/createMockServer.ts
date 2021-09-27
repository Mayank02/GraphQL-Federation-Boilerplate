import { createMocks, MockResponse } from './createMocks';
import * as YAML from 'yaml';
import fs from 'fs';
import OpenAPIBackend, { Request } from 'openapi-backend';
import express from 'express';
import { logger } from './logger';

export function createMockServer(
  specsPath: string,
  mocksPath: string,
  port: number
) {
  // Prepare mocks
  const mockDefinitions = YAML.parse(fs.readFileSync(mocksPath, 'UTF-8'));
  const mocks = createMocks(mockDefinitions);

  // create api with your definition file or object
  const api = new OpenAPIBackend({
    definition: specsPath,
    // strict: true,
    ajvOpts: {
      unknownFormats: ['int32'],
      // strictKeywords: 'log',
      // strictDefaults: 'log',
      nullable: true,
      // missingRefs: true,
      allErrors: true,
      verbose: true,
      // useDefaults: false,
    },
  });

  api.register({
    ...mocks,
    validationFail: (c, req, res) =>
      res.status(400).json({ err: c.validation.errors }),
    postResponseHandler: (c, req, res) => {
      let mockResponse = c.response as MockResponse;

      const valid = c.api.validateResponse(
        mockResponse.json,
        c.operation,
        mockResponse.status
      );

      if (!valid.valid || valid.errors) {
        // response validation failed
        return res.status(502).json({ status: 502, err: valid.errors });
      }
      return res
        .set(mockResponse.headers)
        .status(mockResponse.status)
        .json(mockResponse.json);
    },
    notFound: (c, req, res) =>
      res.status(404).json({ err: 'not found in open api spec' }),
  });

  // Initialize the Open API backend
  api.init();

  // Initialize an express app to host the backend
  const expressApp = express();
  expressApp.use(logger);
  expressApp.use(express.json());
  expressApp.use((req, res) => api.handleRequest(req as any, req, res));

  expressApp.listen(port, () => {});
}
