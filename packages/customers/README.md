# Customers GraphQL Service

It uses:

- [API mock server](/open-api-mock-server)

Quick start after installation:

```
yarn start
```

By default, it listens on: [http://localhost:14003/graphql](http://localhost:14003/graphql)

Sample Headers:

```
{
"Authorization":"Bearer eyJhbGciOiJIUzI1NiJ9.eyJwYXJ0eUlkIjoiMDEyMzQ1Njc4OSJ9.b7fXhoC8s1AvkRN1wghsWRonIXTcAHBSsjV6Wj6IJKs",
"x-txn-correlation-id":"1234567890"
}
```

```

## Tests

Run test scenarios in `tests/**/*.spec.ts`:

```

yarn test

```

Run test scenarios and show code coverage:

```

yarn test:coverage

```

Run test scenarios and prepare report:

```

yarn test:report

```

```
