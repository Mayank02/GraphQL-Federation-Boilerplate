import { GenderEnum } from '../enums';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ICustomerDetailMapper } from '../services/customers/mappers';
import { ICommonContextType } from '../types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  GraphQLDateTime: any;
  _FieldSet: any;
};






export type CustomerDetail = {
  __typename?: 'CustomerDetail';
  partyId: Scalars['ID'];
  nameDetails: NameDetails;
  dateOfBirth: Scalars['GraphQLDateTime'];
  gender: GenderEnum;
};

export { GenderEnum };


export type NameDetails = {
  __typename?: 'NameDetails';
  firstName?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Simple query to check health */
  timeAtCustomers: Scalars['GraphQLDateTime'];
  /** Get details of customer including list of customer status */
  customerDetail: CustomerDetail;
};


export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;

      type ScalarCheck<T, S> = S extends true ? T : NullableCheck<T, S>;
      type NullableCheck<T, S> = Maybe<T> extends T ? Maybe<ListCheck<NonNullable<T>, S>> : ListCheck<T, S>;
      type ListCheck<T, S> = T extends (infer U)[] ? NullableCheck<U, S>[] : GraphQLRecursivePick<T, S>;
      export type GraphQLRecursivePick<T, S> = { [K in keyof T & keyof S]: ScalarCheck<T[K], S[K]> };
    
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  CustomerDetail: ResolverTypeWrapper<ICustomerDetailMapper>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  GenderEnum: GenderEnum;
  GraphQLDateTime: ResolverTypeWrapper<Scalars['GraphQLDateTime']>;
  NameDetails: ResolverTypeWrapper<NameDetails>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  CustomerDetail: ICustomerDetailMapper;
  ID: Scalars['ID'];
  GraphQLDateTime: Scalars['GraphQLDateTime'];
  NameDetails: NameDetails;
  String: Scalars['String'];
  Query: {};
  Int: Scalars['Int'];
  Boolean: Scalars['Boolean'];
}>;

export type costDirectiveArgs = {   complexity?: Maybe<Scalars['Int']>;
  multipliers?: Maybe<Array<Maybe<Scalars['String']>>>;
  useMultipliers?: Maybe<Scalars['Boolean']>; };

export type costDirectiveResolver<Result, Parent, ContextType = ICommonContextType, Args = costDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CustomerDetailResolvers<ContextType = ICommonContextType, ParentType extends ResolversParentTypes['CustomerDetail'] = ResolversParentTypes['CustomerDetail']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['CustomerDetail']>, { __typename: 'CustomerDetail' } & GraphQLRecursivePick<ParentType, {"partyId":true}>, ContextType>;
  partyId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  nameDetails?: Resolver<ResolversTypes['NameDetails'], ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['GenderEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GenderEnumResolvers = EnumResolverSignature<{ MALE?: any, FEMALE?: any, NON_BINARY?: any, UNSPECIFIED?: any }, ResolversTypes['GenderEnum']>;

export interface GraphQLDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLDateTime'], any> {
  name: 'GraphQLDateTime';
}

export type NameDetailsResolvers<ContextType = ICommonContextType, ParentType extends ResolversParentTypes['NameDetails'] = ResolversParentTypes['NameDetails']> = ResolversObject<{
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ICommonContextType, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  timeAtCustomers?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>;
  customerDetail?: Resolver<ResolversTypes['CustomerDetail'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ICommonContextType> = ResolversObject<{
  CustomerDetail?: CustomerDetailResolvers<ContextType>;
  GenderEnum?: GenderEnumResolvers;
  GraphQLDateTime?: GraphQLScalarType;
  NameDetails?: NameDetailsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ICommonContextType> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = ICommonContextType> = ResolversObject<{
  cost?: costDirectiveResolver<any, any, ContextType>;
}>;


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = ICommonContextType> = DirectiveResolvers<ContextType>;