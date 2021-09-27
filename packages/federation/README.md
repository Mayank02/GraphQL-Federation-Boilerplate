# Federation GraphQL Service

It uses:

- [Accounts GraphQL Service](../gql-accounts/)
- [Customers GraphQL Service](../gql-customers/)

Quick start after installation:

```
yarn start
```

By default, it listens on: [http://localhost:14000/graphql](http://localhost:14000/graphql)

Either turn off basic security check on local (use `AUTH_HEADER _REQUIRED=0` in `.env` file)

Or use the following headers:

```
{"Authorization":"eyJhbGciOiJIUzI1NiJ9.eyJwYXJ0eUlkIjoiMDEyMzQ1Njc4OSJ9.hY9uYepgJqHtSayVDEdU4vseAcfbQfbMjdpAr7hqvF8",
"x-akamai-request-id":"123",
"true-client-ip":"1.1.1.1",
"App-Version":"1.0",
"App-Name":"GNA",
"Platform":"Android"
"x-party-id":"0123456789"
}
```

## Introduction

The purpose of this app is to demonstrate Apollo Federation and how the development of the GraphQL ecosystem could
be federated across several teams and services while still enabling the clients to use a single unified schema to access and mutate server data. It also demonstrates that itwill not be obvious to the client that the server is segmented into separate services because queries can bridge across multiple services within the same query. This design demonstrates that one service may be able to share it's data types to other federated services to facilitate data joins or extensions to existing type by adding data fields. It also shows that the service that is using a scheme type from another federated service needs only a minimal amount of information (eg. primary_key) to be able to join to the external type. This will allow independent development of the different schemas and services with very little coupling between them.
