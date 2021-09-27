import { rule, shield } from 'graphql-shield';

const isAuthenticated = rule()((parent, args, { user }) => {
  return user !== null;
});

export const permissions = shield(
  {
    Query: {
      // customer: isAuthenticated,
    },
  },
  { allowExternalErrors: true },
);
