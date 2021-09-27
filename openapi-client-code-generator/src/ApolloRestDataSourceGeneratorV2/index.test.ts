import jsyaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import {
  ApolloRestDataSourceGeneratorV2, setLogLevel, MakeCommentInput, makeComment, makeEnumDataLookupList, TypeEnumKeyValuePair,
} from '.';

const createdAtOff = true;

function getText(inputYamlFileName, outputTsFileName, serviceName, serviceConfigKey) {
  const specFile = path.resolve(__dirname, '..', '..', 'test', inputYamlFileName);
  const specText = fs.readFileSync(specFile, 'utf8');
  
  const apiFile = path.resolve(__dirname, '..', '..', 'test', outputTsFileName);
  const expectedCode = fs.readFileSync(apiFile, 'utf8');
  
  const rawApi = jsyaml.load(specText);
    
  const generator = new ApolloRestDataSourceGeneratorV2(serviceName, serviceConfigKey, rawApi, createdAtOff);
  const generatedCode = generator.generate();
  return { generatedCode, expectedCode };
}

describe('ApolloRestDataSourceGeneratorV2', () => {
  setLogLevel(0); // error
  
  it('should generate code for pet store api', async() => {
    const { generatedCode, expectedCode } = getText('pet-store.yaml', 'pet-store.ts', 'PetStore', 'petStore');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for accounts api', async() => {
    const { generatedCode, expectedCode } = getText('accounts.yaml', 'accounts.ts', 'Accounts', 'accounts');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for balances api', async() => {
    const { generatedCode, expectedCode } = getText('balances.yaml', 'balances.ts', 'Balances', 'balances');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for beneficiaries api', async() => {
    const { generatedCode, expectedCode } = getText('beneficiaries.yaml', 'beneficiaries.ts', 'Beneficiaries', 'beneficiaries');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for customers api', async() => {
    const { generatedCode, expectedCode } = getText('customers.yaml', 'customers.ts', 'Customers', 'customers');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for domestic payments api', async() => {
    const { generatedCode, expectedCode } = getText('domesticPayments.yaml', 'domesticPayments.ts', 'DomesticPayments', 'domesticPayments');
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code for transactions api', async() => {
    const { generatedCode, expectedCode } = getText('transactions.yaml', 'transactions.ts', 'Transactions', 'transactions');
    expect(generatedCode).toEqual(expectedCode);
  });
});

describe('makeComment', () => {
  it('should make comment string', async() => {
    const input: MakeCommentInput = {
      description: 'description here',
      pattern: 'pattern here',
      format: 'format here',
    }
    const output = makeComment(input);
    const expected = `/**
 * ${input.description}
 * ${input.format}
 * ${input.pattern}
 */`;
    expect(output).toEqual(expected);
  });
});

describe('makeEnumDataLookupList', () => {
  it('should make Enum Data Lookup List array', async() => {
    const enumValues: TypeEnumKeyValuePair[] = [
      { key: '1', value: '1'},
      { key: '2', value: '2'},
      { key: '+672 1', value: '+672 1'},
      { key: '+44', value: '+44'},
    ];
    const desc = `* Marketing Consents = 1 *  Virgin Islands (British) =   VGB * Australian Antarctic Territory (+672 1) * United Kingdom (+44)`;
    const output = makeEnumDataLookupList(enumValues, desc);
    const expected = [
      { label: 'Marketing Consents', id: '1', invalid: false },
      { label: 'Virgin Islands (British)', id: 'VGB', invalid: false },
      { label: 'Australian Antarctic Territory', id: '+672 1', invalid: false },
      { label: 'United Kingdom', id: '+44', invalid: false },
      { label: '2', id: '2' },
    ];
    expect(output).toEqual(expected);
  });
});
