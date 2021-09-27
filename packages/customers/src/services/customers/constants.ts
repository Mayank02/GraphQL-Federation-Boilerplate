export const ERRORS = {
  partyNotFound: new Error('404: Party not found'),
  unauthorized: new Error('401: Unauthorized'),
  unexpectedResponse: new Error(
    '500: Unexpected response from balance service',
  ),
};
