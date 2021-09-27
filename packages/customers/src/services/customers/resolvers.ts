import * as schemaTypes from '../../generated/schema_types';
import * as types from '../../types';
import * as api from './generated';
import * as mappers from './mappers';
import { buildAuthenticationError } from '@common-utils/graphql-shared';
import { convertIntToGenderEnum } from './enums';

export async function findCustomer(
  ctx: types.ICommonContextType,
): Promise<mappers.ICustomerDetailMapper> {
  const partyId =
    ctx.user.partyId ?? buildAuthenticationError('partyId missing!');
  const apiRequest = new api.GetCustomerDetails_Request({
    pathParams: { 'party-id': partyId },
    headers: ctx.headers,
  });
  const apiResponse = await ctx.dataSources.customersApi.getCustomerDetails(
    apiRequest,
  );
  return apiResponse.Data;
}

export const resolvers: schemaTypes.Resolvers = {
  Query: {
    timeAtCustomers: () => new Date(),
    customerDetail: async (parent, args, ctx) => {
      return findCustomer(ctx);
    },
  },
  CustomerDetail: {
    partyId: (parent) => parent.Customer.CustomerId,
    nameDetails: (parent) => {
      return {
        firstName: parent.Customer?.FirstName,
        middleName: parent.Customer?.MiddleName,
        lastName: parent.Customer?.LastName,
      };
    },
    dateOfBirth: (parent) => parent.Customer?.DateOfBirth,
    gender: (parent) => convertIntToGenderEnum(parent.Customer?.Gender),
  },
};
