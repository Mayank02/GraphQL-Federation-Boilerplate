# About The Project

Server-side code generator for Apollo RESTDataSource using OpenAPI spec files and React.
Preffered way is to have this repo as a submodule, and use the CLI to generate RESTDataSources

## Built With

- [Node](https://nodejs.org/en/) version 14.15.4
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

* Gather dependencies

```
npm i
```

* Start web UI

```
npm run start
```

* Use CLI

```
node -r ./bin/tshook.js ./bin/gen.ts -l 1 -i ./examples/OpenAPI-v3/accounts.yaml -o ./examples/OpenAPI-v3/accounts2.ts -n Accounts -c accounts
```

Options:

```
-l, --log-level <level>         log level 0: error, 1: warning, 2: info, 3: debug; defaults to 0
-i, --input <file>              input file (OpenAPI v3 spec) - REQUIRED
-o, --output <file>             destination file (Apollo REST data source) - REQUIRED
-n, --service-name <name>       service name is used as prefix for Apollo class name e.g. 'Accounts'; defaults to 'Api'
-c, --service-config-key <key>  service config key used by apollo class e.g. 'accounts'; defaults to 'api'
```


## Ref
Link to [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification)

