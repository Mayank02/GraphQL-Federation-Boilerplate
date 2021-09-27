#!/bin/bash

#
# see https://graphql-code-generator.com
#
# npm i -g graphql
# npm i -g @graphql-codegen/cli
# npm i -g @graphql-codegen/typescript
# npm i -g @graphql-codegen/typescript-resolvers
# npm i -g @graphql-codegen/add
# npm i -g @graphql-codegen/introspection
#

# uses:      ./codegen.yaml
# generates: ./src/generated/schema_types.ts
# generates: ./src/generated/schema.json

graphql-codegen
