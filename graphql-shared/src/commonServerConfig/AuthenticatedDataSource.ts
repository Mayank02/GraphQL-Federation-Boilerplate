import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { HTTPHeaders } from '../interfaces/ApiRequest';

export class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }): void {
    const { headers }: HTTPHeaders = context; // incoming request headers
    // warning 'AuthenticatedDataSource.willSendRequest no incoming request headers!'
    // this happens on startup when Apollo Gateway is trying to load schemas from federated services
    if (!headers) return;
    request.http.headers.set(
      'user',
      context.user ? JSON.stringify(context.user) : null,
    );
    Object.entries(headers).forEach(([k, v]) => {
      request.http.headers.set(k, v); // outgoing request headers
    });
  }
}
