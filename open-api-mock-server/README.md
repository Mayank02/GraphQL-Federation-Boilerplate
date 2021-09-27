
# About The Project

This tool leveraging and open-api spec along with supplied mocks in a JSON/YAML file to generate a mock server and also a swagger endpoint to browse the available parameters of the spec. The server creates individual services for each provided open api spec available at different ports and one aggregate server that combines all the provided services into one port with a path prefix based on the configs subdirectory

## Getting Started

The server requires the following parameters to launch:

- Open API spec path - used for generating endpoints and validating requests/responses before returned to the client.
- mocks file (yaml/JSON) containing a dictionary of mocks keyed by each open-api-spec operation name.
- Ports specified via ENV variables
  - `HTTP_PORT` for the the aggregate server of all the endpoints
  - `REST_START_PORT` for the first to use for the child services eg 9000. Subsequent child servers used following ports eg. 9001, 9002...

### Built With

- [Node](https://nodejs.org/en/) version 14.15.4
- [TypeScript](https://www.typescriptlang.org/)

### Run

This will gather dependacies build and start the mock server.

1. yarn install
2. yarn build
3. yarn start

### Execution explained

1. Requests from the client will be validated against the open api spec when called to the server.
2. The validation should first identify which operation the request was intended for based on the HTTP verb and the URL.
3. Then the server will validate all the required parameters and headers are supplied in the correct formats accoding to the spec.
4. If the request is considered valid the server will find a matching response in the associated `mocks.yaml` file based on the matched `operationId`. (This means that each operation in the spec must have an `operationId`.)
   - The matching of the responses will be based on the criteria as described above in the mock structure
   - It will attempt to sort potential matched responses in order of the most stringent matching criteria
     - a mock response that ONLY matches based on a URL regex will be attempted to match AFTER a mock response with URL regex AND a header regex has failed to find a matching response.
5. After a matching mock response is found it will be validated via the open-api spec to ensure the supplied mocks are also compliant for a given open-api response value.
6. The response is returned to the client
7. If no match is found an error will be returned to the client displaying the matched `operationId` and the potential mocks that could be matched for that operation to help diagnose issues quickly.
8. If no matching `operationId` is found for the given request the server will return an error to the client with that message.

Note: So far the open-api specs have often not specified required properties on responses so therefore missing properties are not triggering validation errors unless we modify the open api spec manually to add required fields to repsonses

### Server details

When the server is launched it will look for a folder named configs in the root of the project. The contents of the folder should contain subfolders named as the paths should be reflected in the resulting proxy. The folder structure also supports versioning subfolders as is also seen in the Apigee endpoints. Every version included in the folders will be launched as mock servers onto different ports and with different path componenets in the aggregated server, The contents of each folder should have spec.yaml and mocks.yaml files representing the open-api spec and corresponding mocks for that spec.

eg.

```
    ├── customer
        ├── mocks.yaml
        └── spec.yaml
```

This structure will result in a RESTful proxy with all the openapi spec operations defined in configs/accounts/spec.yaml being available at:

- `localhost:9000/customer`

### Mock file structure

Within each operation several mocks can be supplied with selection criteria based on:

- a regex for the URL path (eg. accountId as part of the path can be specified)
- a regex for headers (eg. auth header value must contain 'token' AND brand must contain 'IF'
- a regex for the request query value for specific key
- a JSONPath for the JSON request body which filters to a particular JSON leaf node that would need to match a further regex.


## Deployment

Please amend the helm chart and ovverides and provide your envioremnt variables.

1. Please see the preperations needed be, before continuing, on page https://ltmhedge.atlassian.net/wiki/spaces/VCT/pages/2257388365/Getting+Started+GQL
2. Go to your Jenkins instance. (Consult with systems team to find out the url)
3. Then in jenkins go to New Item -> Multybranch pipeline create a name same as your repository.
4. Your job -> Configure -> Branch Sources -> Add source select github
5. Credentials - select robot account (Consult systems team)
6. Repsitory HTTPS URL add your gql repository url and click save

It will run a scan on your repsitory and pick up any brach that has a Jenkinsfile.

## Accessing already deployed service on GCP

The service is on deployable via Jenkins on GCP the root of the mocks is accessible at:

https://*--*/{mockservice}/{open-api-spec-url} for the REST endpoints
https://*--*/swagger/ for the Swagger browser for all supplied services.
