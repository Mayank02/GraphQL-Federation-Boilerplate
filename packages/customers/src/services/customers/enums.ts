export {} from // Party__PartyResourceType as PartyPartyResourceTypeEnum,
// Party__PartyType as PartyPartyTypeEnum,
'./generated';

const errorMessage = 'unexpected response from service';

export enum NumericFilterOperationsEnum {
  EQ = 'EQ',
  LE = 'LE',
  LT = 'LT',
  GE = 'GE',
  GT = 'GT',
}
export enum OrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  UNSPECIFIED = 'UNSPECIFIED',
}

export function convertIntToGenderEnum(
  s: number | undefined | null,
): GenderEnum {
  if (s === 1) return GenderEnum.MALE;
  if (s === 2) return GenderEnum.FEMALE;
  if (s === 3) return GenderEnum.UNSPECIFIED;
  if (s === 4) return GenderEnum.NON_BINARY;
  throw new Error(errorMessage);
}
