# About The Project

This is a GraphQL federation boilerplate for running service individually as well as federation environment with mock data setup

## Getting Started

There are multiple modules and packages. Below I have mentioned the steps to setup your local environment step by step.

## Build Run
This will gather dependencies build and start the server.

### Root level
This will resolve the dependencies at root level

1. yarn

### graphql-shared
This is had all the common methods related to security and performance. We have to install the dependencies and build the package.

1. yarn
2. yarn build

### open-api-mock-server
This is mock server where we define the schema and set the mock value against it. For example you can check the config folder. We have to install the dependencies, build and start the mock server.
Note: Create/copy env variable from env.sample file

1. yarn
2. yarn build
3. yarn start

Mock server should be running on port http://localhost:8080/swagger

### openapi-client-code-generator
This is schema generator for the service. We have to install the dependencies and build.

1. yarn
2. yarn build

### packages => customer
This is an individual graphql service where we have defined the schema, resolver etc. To run the services there are few step install the dependencies, generate the schema, build and start the server.
Note: Create/copy env variable from env.sample file

1. yarn
2. yarn gen:client
3. yarn build
4. yarn start

Customer service should be running on port http://localhost:14001/graphql

you can use the below query to validate

```
query getCustomerDetails {
    customerDetail {
      nameDetails {
        firstName
        middleName
        lastName
      }
    }
  }
```

Add headers

```
{
    "authorization": "Bearer",
    "user": "{\"partyId\": \"0123456789\"}",
    "x-party-id": "0123465878"
}
```

### packages => federation
This is federation layer where we can see the combined view of all the service.To run the services install the dependencies and start the server.

Pre-requisite: All the services should be running to be able to run the federation server.

Note: Create/copy env variable from env.sample file

1. yarn
2. yarn start

application should be running on port http://localhost:14000/graphql
you can validate using the above query
