import * as oa3 from '../OpenApiV3/types';

export const CONTENT_TYPE_JSON = 'application/json';
export const CONTENT_TYPE_JSON_UTF8 = 'application/json; charset=utf-8';

export const TYPE_STRING = 'string';
export const TYPE_NUMBER = 'number';
export const TYPE_INT = 'integer';
export const TYPE_BOOL = 'boolean';
export const TYPE_NULL = 'null';
export const TYPE_SCALARS = [
  TYPE_STRING,
  TYPE_NUMBER,
  TYPE_INT,
  TYPE_BOOL,
  TYPE_NULL,
];
export const TYPE_OBJECT = 'object';
export const TYPE_ARRAY = 'array';

export const COMP_SECTION_SCHEMAS = 'schemas';
export const COMP_SECTION_PARAMS = 'parameters';
export const COMP_SECTION_HEADERS = 'headers';
export const COMP_SECTION_REQUESTS = 'requestBodies';
export const COMP_SECTION_RESPONSES = 'responses';

let LOG_LEVEL = 2; // 0: error, 1: warning, 2: info, 3: debug
export function setLogLevel(newLevel: number) {
  LOG_LEVEL = newLevel;
}

export const TypeName_ObjectWithNoPropsDefined = 'ObjectWithNoPropsDefined';
export const TypeName_ObjectWithStringProps = 'ObjectWithStringProps';

export const c = {
  debug: (...args: any[]) => {
    if (3 <= LOG_LEVEL) console.log.call(null, ...args);
  },
  info: (...args: any[]) => {
    if (2 <= LOG_LEVEL) console.info.call(null, ...args);
  },
  warn: (...args: any[]) => {
    if (1 <= LOG_LEVEL) console.warn.call(null, ...args);
  },
  error: (...args: any[]) => {
    if (0 <= LOG_LEVEL) console.error.call(null, ...args);
  },
  log: (...args: any[]) => {
    console.log.call(null, ...args); // log args, regardless of log level set
  },
};

export class ApolloRestDataSourceGeneratorV2 {
  private pathList: string[] = [];
  private typeMap: TypeModelMap = {};
  private typeSourceCache: TypeSourceMap = {};
  private operationList: OperationModel[] = [];

  constructor(
    private serviceName: string,
    private serviceConfigKey: string,
    private rawApi: oa3.OpenAPIObject,
    private createdAtOff = false,
  ) {
    // todo: validate rawApi object using JsonSchema
  }

  setType(name: string, model: TypeModel): TypeModel {
    if (this.typeMap.hasOwnProperty(name)) {
      const existingModel = this.typeMap[name];
      c.warn('setType: model resolved already', name);
      if (
        model.rawSource &&
        existingModel.rawSource &&
        model.rawSource !== existingModel.rawSource
      ) {
        c.error(
          'setType: model resolved already',
          name,
          'ERROR sources are different',
        );
        throw new Error('sources are different for same model name: ' + name);
      }
    } else {
      c.info(' * setType *', name, model);
      this.typeMap[name] = model;
    }
    return model;
  }

  getType(name: string): TypeModel | null {
    if (this.typeMap.hasOwnProperty(name)) return this.typeMap[name];
    return null;
  }

  delType(name: string) {
    if (this.typeMap.hasOwnProperty(name)) {
      delete this.typeMap[name];
    }
  }

  setTypeSource(ref: string, source: TypeSource): TypeSource {
    if (this.typeSourceCache.hasOwnProperty(ref)) {
      console.warn(
        'source resolved already',
        ref,
        'new',
        source,
        'old',
        this.typeSourceCache[ref],
      );
    } else {
      this.typeSourceCache[ref] = source;
    }
    return source;
  }

  getTypeSource(ref: string): TypeSource | null {
    if (this.typeSourceCache.hasOwnProperty(ref))
      return this.typeSourceCache[ref];
    return null;
  }

  generate(): string {
    const t1 = new Date();

    this.makeTypes(); // process what we know from #/components/... or we can make types as we discovered
    this.makeOperations();

    const header = this.templateHeader(
      t1.toISOString(),
      this.rawApi.info.description,
    );
    const pathList = this.templatePathList();
    const apiClassStart = this.templateApiClassStart();
    const apiClassMethods = this.templateApiClassMethods();
    const apiClassEnd = this.templateApiClassEnd();
    const types = this.templateTypes();
    const footer = this.templateFooter();

    const t2 = new Date();
    const delta = t2.getTime() - t1.getTime();

    const code = `${header}
${pathList}
${apiClassStart}
${apiClassMethods}
${apiClassEnd}
${types}
${footer}
`;
    c.debug('done', delta, 'ms');
    return code;
  }

  makeTypes() {
    this.typeMap = {};

    const {
      schemas = {},
      parameters = {},
      requestBodies = {},
      responses = {},
    } = this.rawApi.components ?? {};
    let ref: string, modelName: string, source: TypeSource;

    // cache all sources first -------------------------------------------
    c.debug(' . makeTypes LOOP caching sources of schemas...');
    for (let name in schemas) {
      ref = '#/components/schemas/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
    }
    c.debug(' . makeTypes LOOP caching sources of parameters...');
    for (let name in parameters) {
      ref = '#/components/parameters/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
    }
    c.debug(' . makeTypes LOOP caching sources of request bodies...');
    for (let name in requestBodies) {
      ref = '#/components/requestBodies/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
    }
    c.debug(' . makeTypes LOOP caching sources of responses...');
    for (let name in responses) {
      ref = '#/components/responses/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
    }

    // generate models ---------------------------------------------------
    for (let name in schemas) {
      c.debug(' . makeTypes LOOP processing schema...', name);
      ref = '#/components/schemas/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
      this.makeModelFromSource(modelName, source);
    }
    for (let name in parameters) {
      c.debug(' . makeTypes LOOP processing parameter...', name);
      ref = '#/components/parameters/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
      this.makeModelFromSource(modelName, source);
    }
    for (let name in requestBodies) {
      c.debug(' . makeTypes LOOP processing requestBody...', name);
      ref = '#/components/requestBodies/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
      this.makeModelFromSource(modelName, source);
    }
    for (let name in responses) {
      c.debug(' . makeTypes LOOP processing response...', name);
      ref = '#/components/responses/' + name;
      modelName = refPathToName(ref);
      source = this.getTypeSourceByRef(ref);
      this.makeModelFromSource(modelName, source);
    }
  }

  makeModelFromSource(name: string, source: TypeSource): TypeMakeModelOutput {
    if (source.isRef && source.refObj) {
      c.debug(' . makeModelFromSource', name, 'is REF', source);
      const ref = source.refObj?.$ref || '';
      return this.makeModelFromReference(ref, null);
    }
    if (source.isSchemaObj && source.schemaObj) {
      c.debug(' . makeModelFromSource', name, 'is SCHEMA', source);
      const model = this.makeModelFromSchema(name, source.schemaObj);
      return { model, modelName: model.name, source };
    }
    if (source.isRequestBodyObj && source.requestBodyObj) {
      c.debug(' . makeModelFromSource', name, 'is REQUEST BODY', source);
      return this.makeModelFromRequestBody(name, source.requestBodyObj);
    }
    if (source.isResponseObj && source.responseObj) {
      c.debug(' . makeModelFromSource', name, 'is RESPONSE', source);
      return this.makeModelFromResponseBody(name, source.responseObj);
    }
    if (source.isParamObj && source.paramObj) {
      c.debug(' . makeModelFromSource', name, 'is PARAM', source);
      const schemaOrRef = source.paramObj.schema ?? null;
      if (!schemaOrRef) throw new Error('parameter ' + name + ' has no schema');
      const paramModelName = name;
      return this.makeModelFromSchemaOrRef(paramModelName, schemaOrRef);
    }
    c.error(' . makeModelFromSource', name, 'UNKNOWN', source);
    throw new Error('invalid model source: ' + name);
  }

  makeModelFromSchema(
    name: string,
    rawSource: oa3.SchemaObject,
    dontRegisterScalarProp = false,
  ): TypeModel {
    c.debug(' > makeModelFromSchema', name, rawSource);
    let model: TypeModel | null = this.getType(name);
    if (model) {
      c.info(' << makeModelFromSchema', name, '*CACHE*');
      return model;
    }

    let strType = String(rawSource.type ?? '').trim();

    const description = rawSource.description ?? '';
    const pattern = rawSource.pattern ?? '';
    const format = rawSource.format ?? '';
    const props = rawSource.properties ?? null;
    const itemsObj = rawSource.items ?? null;
    const enums = rawSource.enum ?? [];
    const nullable = rawSource.nullable ?? false;
    const allOfArr = rawSource.allOf ?? [];
    const anyOfArr = rawSource.anyOf ?? [];

    const requiredPropNames = rawSource.required ?? [];
    const propsNames = props ? Object.getOwnPropertyNames(props) : [];
    const itemsObjPropNames = itemsObj
      ? Object.getOwnPropertyNames(itemsObj)
      : [];

    if (strType === '' && propsNames.length) {
      //special case
      strType = TYPE_OBJECT; // assumption
    }
    if (strType === '' && itemsObjPropNames.length) {
      //special case
      strType = TYPE_ARRAY; // assumption
    }
    if (strType === '' && pattern !== '') {
      //special case
      strType = TYPE_STRING; // assumption
    }
    if (strType === TYPE_INT) strType = TYPE_NUMBER; // special case

    let addedScalars = false; // used when processing allOf, anyOf
    do {
      // process use allOf
      if (allOfArr && allOfArr.length) {
        // a complex type
        c.debug(' > makeModelFromSchema', name, 'has ALLOF');
        let allOfTargetTypeNames: string[] = [];
        const modelScalarAllOf: TypeScalar = {
          name,
          description,
          targetTypeNames: allOfTargetTypeNames,
          joinTypes: '&',
          nullable,
          rawSource,
        };
        model = modelScalarAllOf;
        this.setType(name, modelScalarAllOf); // register ASAP, always register complex types

        if (rawSource.type) {
          const rawSourceRoot = { ...rawSource, allOf: undefined }; // shallow clone without allOf
          const modelNameRoot = name + '_AllOfRoot';
          const modelRoot = this.makeModelFromSchema(
            modelNameRoot,
            rawSourceRoot,
          );
          if (isInstanceOfTypeScalar(modelRoot)) {
            // special case to avoid ref to custom intermediate model
            const everyTargetTypeNameIsScalar = modelRoot.targetTypeNames.every(
              (n) => TYPE_SCALARS.includes(n),
            );
            if (everyTargetTypeNameIsScalar) {
              // gather unique target type names
              modelRoot.targetTypeNames.forEach((t) => {
                if (!modelRoot.targetTypeNames.includes(t))
                  allOfTargetTypeNames.push(t);
              });
              addedScalars = true;
            }
          }
          if (!addedScalars) allOfTargetTypeNames.push(modelNameRoot);
        }
        for (let idx = 0; idx < allOfArr.length; idx++) {
          let allOfItem = allOfArr[idx];
          let allOfItemModelName = name + '_AllOf' + idx;
          if (oa3.isReferenceObject(allOfItem)) {
            allOfItemModelName = refPathToName(allOfItem.$ref); // quick work around to avoid having intermediate type
          }
          const modelItemRef = this.makeModelFromSchemaOrRef(
            allOfItemModelName,
            allOfItem,
          );
          addedScalars = false;
          if (isInstanceOfTypeScalar(modelItemRef.model)) {
            // special case to avoid ref to custom intermediate model
            const everyTargetTypeNameIsScalar = modelItemRef.model.targetTypeNames.every(
              (n) => TYPE_SCALARS.includes(n),
            );
            if (everyTargetTypeNameIsScalar) {
              // gather unique target type names
              modelItemRef.model.targetTypeNames.forEach((t) => {
                if (!allOfTargetTypeNames.includes(t))
                  allOfTargetTypeNames.push(t);
              });
              addedScalars = true;
            }
          }
          if (!addedScalars) allOfTargetTypeNames.push(modelItemRef.model.name);
        }
        modelScalarAllOf.targetTypeNames = allOfTargetTypeNames; // update registered model
        break; // exit loop
      }

      // process use anyOf
      if (anyOfArr && anyOfArr.length) {
        // a complex type
        c.debug(' > makeModelFromSchema', name, 'has ANYOF');
        const modelScalarAnyOf: TypeScalar = {
          name,
          description,
          targetTypeNames: [],
          joinTypes: '|',
          nullable,
          rawSource,
        };
        model = modelScalarAnyOf;
        this.setType(name, modelScalarAnyOf); // register ASAP, always register complex types

        let anyOfTargetTypeNames: string[] = [];
        if (rawSource.type) {
          const rawSourceRoot = { ...rawSource, anyOf: undefined }; // shallow clone without allOf
          const modelNameRoot = name + '_AnyOfRoot';
          addedScalars = false;
          const modelRoot = this.makeModelFromSchema(
            modelNameRoot,
            rawSourceRoot,
          );
          if (isInstanceOfTypeScalar(modelRoot)) {
            // special case to avoid ref to custom intermediate model
            const everyTargetTypeNameIsScalar = modelRoot.targetTypeNames.every(
              (n) => TYPE_SCALARS.includes(n),
            );
            if (everyTargetTypeNameIsScalar) {
              // gather unique target type names
              modelRoot.targetTypeNames.forEach((t) => {
                if (!anyOfTargetTypeNames.includes(t))
                  anyOfTargetTypeNames.push(t);
              });
              addedScalars = true;
            }
          }
          if (!addedScalars) anyOfTargetTypeNames.push(modelNameRoot);
        }
        for (let idx = 0; idx < anyOfArr.length; idx++) {
          addedScalars = false;
          let anyOfItem = anyOfArr[idx];
          let anyOfItemModelName = name + '_AnyOf' + idx;
          if (oa3.isReferenceObject(anyOfItem)) {
            anyOfItemModelName = refPathToName(anyOfItem.$ref); // quick work around to avoid having intermediate type
          }
          const modelItemRef = this.makeModelFromSchemaOrRef(
            anyOfItemModelName,
            anyOfItem,
          );
          if (isInstanceOfTypeScalar(modelItemRef.model)) {
            // special case to avoid ref to custom intermediate model
            const everyTargetTypeNameIsScalar = modelItemRef.model.targetTypeNames.every(
              (n) => TYPE_SCALARS.includes(n),
            );
            if (everyTargetTypeNameIsScalar) {
              // gather unique target type names
              modelItemRef.model.targetTypeNames.forEach((t) => {
                if (!anyOfTargetTypeNames.includes(t))
                  anyOfTargetTypeNames.push(t);
              });
              addedScalars = true;
            }
          }
          if (!addedScalars) anyOfTargetTypeNames.push(modelItemRef.model.name);
        }
        modelScalarAnyOf.targetTypeNames = anyOfTargetTypeNames;
        break; // exit loop
      }

      if (isScalarType(strType)) {
        if (enums.length) {
          // special case with ENUM values

          if (nullable) {
            // rename default enum
            c.debug(' > makeModelFromSchema', name, 'has ENUM', '*NULLABLE*');
            const enumName = name + '_Required'; // e.g. 'CustomerTitle_Required'
            const modelEnum: TypeEnum = {
              name: enumName,
              description,
              typeName: strType,
              enumValues: enums.map((enumValue: any) =>
                makeEnumKeyValuePair(String(enumValue)),
              ),
              nullable: false,
              rawSource,
            };
            this.setType(enumName, modelEnum); // register ASAP!

            // create a new model ref to 'nullable' enum
            c.debug(
              ' > makeModelFromSchema',
              name,
              'SCALAR ref to NULLABLE ENUM',
            );
            const modelEnumNullable: TypeScalar = {
              name,
              description: 'articial enum type refers to ref enum -NULLABLE-',
              targetTypeNames: [enumName, 'null'],
              nullable: true,
              rawSource: { $ref: '#/components/schemas/' + enumName },
            };
            model = modelEnumNullable;
            this.setType(name, modelEnumNullable); // register ASAP!
          } else {
            // NOT NULLABLE
            c.debug(' > makeModelFromSchema', name, 'has ENUM');
            const modelEnum: TypeEnum = {
              name,
              description,
              typeName: strType,
              enumValues: enums.map((enumValue: any) =>
                makeEnumKeyValuePair(String(enumValue)),
              ),
              nullable,
              rawSource,
            };
            model = modelEnum;
            this.setType(name, model); // register ASAP!
          }
        } else {
          // NOT ENUM

          const modelScalar: TypeScalar = {
            name,
            description: rawSource.description,
            targetTypeNames: [strType], // special case
            format: rawSource.format,
            pattern: rawSource.pattern,
            nullable: rawSource.nullable,
            rawSource,
          };
          c.debug(' > makeModelFromSchema', name, 'SCALAR');
          model = modelScalar;
          if (!dontRegisterScalarProp) this.setType(name, model);
        }
        break; // exit loop
      }

      if (strType === TYPE_OBJECT) {
        const modelClassName = name;
        const properties: TypeScalar[] = [];

        if (0 === propsNames.length) {
          // interesting special case ***
          c.warn(' > makeModelFromSchema', name, 'OBJECT', '*NO PROPS*');
          const modelScalar: TypeScalar = {
            name,
            description,
            targetTypeNames: [TypeName_ObjectWithNoPropsDefined],
            nullable,
            rawSource,
          };
          model = modelScalar;
          this.setType(name, model); // register
          break; // exit loop
        } else {
          c.debug(' > makeModelFromSchema', name, 'OBJECT');
          const modelClass: TypeClass = {
            name,
            description,
            requiredPropNames,
            properties,
            nullable: rawSource.nullable,
            rawSource,
          };
          model = modelClass;
          this.setType(name, model); // register ASAP!

          const glue = '__'; // 2 instead of 1 '_' due to clashing model names for different structures

          for (let propName of propsNames) {
            // process object PROPS
            const propSchemaOrRefObj = props?.[propName] ?? null;
            if (!propSchemaOrRefObj)
              throw new Error('property not found: ' + name); // just to keep TS happy

            const required = requiredPropNames.includes(propName);
            if (oa3.isReferenceObject(propSchemaOrRefObj)) {
              c.debug(
                ' > > makeModelFromSchema',
                name,
                'OBJECT',
                '*PROP*',
                propName,
                'REF',
                propSchemaOrRefObj,
              );
              const propModelRef = this.makeModelFromReference(
                propSchemaOrRefObj.$ref,
              );
              // NO need to register this prop model
              const propScalarModel: TypeScalar = {
                // keep only ref to it
                name: propName,
                targetTypeNames: [propModelRef.model.name],
                isProp: true,
                required,
                rawSource: propSchemaOrRefObj,
              };
              modelClass.properties.push(propScalarModel);
            } else {
              // CUSTOM SCHEMA * * *

              c.debug(
                ' > > makeModelFromSchema',
                name,
                'OBJECT',
                '*PROP*',
                propName,
                'CUSTOM SCHEMA',
                propSchemaOrRefObj,
              );
              const propModelName =
                modelClassName + glue + firstLetterUp(propName);
              const propModel = this.makeModelFromSchema(
                propModelName,
                propSchemaOrRefObj,
                true,
              ); // RECURSION * * *
              let targetTypeNames = [propModel.name];
              if (isInstanceOfTypeScalar(propModel)) {
                // special case to avoid ref to custom intermediate model
                const everyTargetTypeNameIsScalar = propModel.targetTypeNames.every(
                  (n) => TYPE_SCALARS.includes(n),
                );
                if (everyTargetTypeNameIsScalar) {
                  targetTypeNames = propModel.targetTypeNames;
                }
              }
              const propScalarModel: TypeScalar = {
                // keep only ref to it
                name: propName,
                targetTypeNames,
                isProp: true,
                required,
                nullable: propSchemaOrRefObj.nullable,
                format: propSchemaOrRefObj.format,
                rawSource: propSchemaOrRefObj,
              };
              modelClass.properties.push(propScalarModel);
            }
          } // loop PROPS

          break; // exit loop
        }
      }

      if (strType === TYPE_ARRAY && itemsObj) {
        // process array ITEMS

        if (!itemsObj)
          throw new Error('array model ' + name + ' has no items defined'); // unexpected
        const modelArray: TypeArray = {
          name,
          description,
          nullable,
          rawSource,
        };
        model = modelArray;
        this.setType(name, model); // register ASAP! or // no need to define array type (?)

        if (oa3.isReferenceObject(itemsObj)) {
          c.debug(
            ' > makeModelFromSchema',
            name,
            'ARRAY of items REF',
            itemsObj.$ref,
          );
          const itemsRef = this.makeModelFromReference(itemsObj.$ref); // process and cache the model
          modelArray.itemsModel = itemsRef.model;
        } else {
          // CUSTOM SCHEMA for items in ARRAY

          const itemsModelName = name + 'ArrayItem'; // TODO: is name unique?
          c.debug(
            ' > makeModelFromSchema',
            name,
            'ARRAY of items SCHEMA',
            itemsModelName,
            itemsObj,
          );
          const itemsModel = this.makeModelFromSchema(itemsModelName, itemsObj); // RECURSION ***
          modelArray.itemsModel = itemsModel; // it may be simply 'string' also a complex type
        }
        break;
      }
    } while (false); // loop once

    if (model) {
      // ok
    } else {
      c.error(
        ' !! makeModelFromSchema',
        name,
        'failed to make model',
        'now using ANY',
      );
      const tmpModel: TypeScalar = {
        name,
        targetTypeNames: ['any'],
        description,
        format,
        pattern,
        nullable,
        rawSource,
      };
      this.setType(name, tmpModel);
      model = tmpModel;
    }
    c.info(' << makeModelFromSchema', name, '==>', model);
    return model;
  }

  makeModelFromReference(
    ref: string,
    _source: TypeSource | null = null,
  ): TypeMakeModelOutput {
    if (ref === '') throw new Error('invalid ref');
    let modelName = refPathToName(ref);
    const source = _source ?? this.getTypeSourceByRef(ref);
    c.debug(' * makeModelFromReference', ref, 'START', modelName, source);
    const srcResult = this.makeModelFromSource(modelName, source);
    const result2 = {
      modelName: srcResult.model.name,
      model: srcResult.model,
      source,
      isRef: true,
    };
    c.debug(
      ' * makeModelFromReference',
      ref,
      'END',
      srcResult.model.name,
      '==>',
      result2,
    );
    return result2;
  }

  makeModelFromRequestBody(
    name: string,
    requestBodyObj: oa3.RequestBodyObject,
  ): TypeMakeModelOutput {
    const content = requestBodyObj.content ?? {};
    const contentTypeJson =
      content?.[CONTENT_TYPE_JSON] ?? content?.[CONTENT_TYPE_JSON_UTF8] ?? {};
    const schemaObj = contentTypeJson?.schema ?? null;
    if (schemaObj) {
      c.debug(' - makeModelFromRequestBody', name, 'START', requestBodyObj);
      const result = this.makeModelFromSchemaOrRef(name, schemaObj);
      c.debug(' - makeModelFromRequestBody', name, 'END ==>', result);
      return result;
    }

    c.warn(
      ' - makeModelFromRequestBody',
      name,
      'CONTENT SCHEMA NOT FOUND - using NULL',
    );
    const model: TypeScalar = {
      name,
      description: requestBodyObj.description,
      targetTypeNames: ['null'],
      isRequestBody: true,
      rawSource: requestBodyObj,
    };
    this.setType(name, model); // add to list
    return { model, modelName: name, isRef: true }; // as if 'null' refers to $ref
    // TODO: review other content types
  }

  makeModelFromResponseBody(
    name: string,
    responseObj: oa3.ResponseObject,
  ): TypeMakeModelOutput {
    const content = responseObj.content ?? {};
    const contentTypeJson =
      content?.[CONTENT_TYPE_JSON] ?? content?.[CONTENT_TYPE_JSON_UTF8] ?? {};
    const schemaObj = contentTypeJson?.schema ?? null;
    if (schemaObj) {
      c.debug(' - makeModelFromResponseBody', name, 'START', responseObj);
      const result = this.makeModelFromSchemaOrRef(name, schemaObj);
      c.debug(' - makeModelFromResponseBody', name, 'END ==>', result);
      return result;
    }

    c.warn(
      '- makeModelFromResponseBody',
      name,
      'CONTENT SCHEMA NOT FOUND - using NULL',
    );
    const model: TypeScalar = {
      name,
      description: responseObj.description,
      targetTypeNames: ['null'],
      isResponseBody: true,
      rawSource: responseObj,
    };
    this.setType(name, model); // add to list
    return { model, modelName: name, isRef: true }; // as if 'null' refers to $ref
  }

  makeModelFromSchemaOrRef(
    name: string,
    schemaObj: oa3.SchemaOrRef,
  ): TypeMakeModelOutput {
    if (oa3.isReferenceObject(schemaObj)) {
      c.debug(' > > > makeModelFromSchemaOrRef', name, 'is REF', schemaObj);
      const source: TypeSource = { isRef: true, refObj: schemaObj };
      const { model, modelName } = this.makeModelFromReference(
        schemaObj.$ref,
        source,
      );
      const modelToRefModel: TypeScalar = {
        name,
        targetTypeNames: [modelName],
        isSchema: true,
        rawSource: schemaObj,
      };
      if (name !== modelName) {
        // register model referring to model if names are different
        this.setType(name, modelToRefModel);
      }
      return { model, modelName, source, isRef: true };
    } else {
      // CUSTOM SCHEMA

      c.debug(' > > > makeModelFromSchemaOrRef', name, 'is SCHEMA', schemaObj);
      const model = this.makeModelFromSchema(name, schemaObj);
      return { model, modelName: model.name };
    }
  }

  makeOperations(): void {
    this.operationList = [];
    this.pathList = [];
    const paths: oa3.PathsObject = this.rawApi.paths;

    let pathNames = Object.getOwnPropertyNames(paths),
      methods,
      methodNames: string[];

    const opPattern = /[^A-Za-z0-9_]/g;

    for (let path of pathNames) {
      methods = paths[path];
      methodNames = Object.getOwnPropertyNames(methods);

      for (let httpMethod of methodNames) {
        const methodDetails = methods[httpMethod];
        c.debug(
          'makeOperations PATH',
          path,
          'METHOD',
          httpMethod,
          methodDetails,
        );
        let {
          operationId = null,
          description = '',
          responses = {},
        } = methodDetails;
        operationId = operationId ?? httpMethod + '_' + path;
        operationId = operationId.replace(opPattern, '_'); // in case there are invalid chars
        const params = methodDetails.parameters ?? [];

        const OpId = firstLetterUp(operationId);
        let requestBodyModel: TypeModel | null = null;
        let requestModelName = OpId + '_Request'; // using '_' because some spec has already 'Request' suffix
        let requestBodyModelName = OpId + '_RequestBody';
        let headerParamsModelName = OpId + '_RequestHeaderParams';
        let pathParamsModelName = OpId + '_RequestPathParams';
        let queryParamsModelName = OpId + '_RequestQueryParams'; // TODO: extend URLSearchParamsInit
        let cookieParamsModelName = OpId + '_RequestCookieParams';
        let responseBodyModelName = OpId + '_ResponseBody'; // TODO: because Apollo returns response body

        const requestModelToRegister: TypeClass = {
          name: requestModelName,
          properties: [],
          isRequest: true,
        };
        this.setType(requestModelName, requestModelToRegister); // register ASAP!
        const pathParamsModel = this.makeModelFromParamsInLocation(
          pathParamsModelName,
          params,
          'path',
        );
        const queryParamsModel = this.makeModelFromParamsInLocation(
          queryParamsModelName,
          params,
          'query',
        );
        const headerParamsModel = this.makeModelFromParamsInLocation(
          headerParamsModelName,
          params,
          'header',
        );
        const cookieParamsModel = this.makeModelFromParamsInLocation(
          cookieParamsModelName,
          params,
          'cookie',
        );

        let pathParamsStr = '';
        if (pathParamsModel) {
          requestModelToRegister.properties.push({
            name: 'pathParams',
            targetTypeNames: [pathParamsModelName],
          } as TypeScalar);
          if (
            isInstanceOfTypeClass(pathParamsModel) &&
            pathParamsModel.properties.length
          ) {
            pathParamsStr =
              "'" +
              pathParamsModel.properties.map((p) => p.name).join("', '") +
              "'";
          }
        }
        if (queryParamsModel)
          requestModelToRegister.properties.push({
            name: 'query',
            targetTypeNames: [queryParamsModelName],
          } as TypeScalar);
        if (headerParamsModel)
          requestModelToRegister.properties.push({
            name: 'headers',
            targetTypeNames: [headerParamsModelName],
          } as TypeScalar);
        if (cookieParamsModel)
          requestModelToRegister.properties.push({
            name: 'cookies',
            targetTypeNames: [cookieParamsModelName],
          } as TypeScalar);

        if (methodDetails.requestBody) {
          if (oa3.isReferenceObject(methodDetails.requestBody)) {
            c.debug(
              'makeOperations PATH',
              path,
              'METHOD',
              httpMethod,
              'request body REF',
            );
            const reqBodyRef = this.makeModelFromReference(
              methodDetails.requestBody.$ref,
            );
            requestBodyModel = reqBodyRef.model;
            requestBodyModelName = reqBodyRef.modelName;
          } else {
            // custom model
            c.debug(
              'makeOperations PATH',
              path,
              'METHOD',
              httpMethod,
              'request body SCHEMA',
            );
            const reqBodyRef = this.makeModelFromRequestBody(
              requestBodyModelName,
              methodDetails.requestBody,
            );
            requestBodyModel = reqBodyRef.model;
          }
        } else {
          c.debug(
            'makeOperations PATH',
            path,
            'METHOD',
            httpMethod,
            'request body NULL',
          );
          requestBodyModelName = 'null';
        }

        requestModelToRegister.properties.push({
          name: 'body',
          targetTypeNames: [requestBodyModelName],
        } as TypeScalar);
        requestModelToRegister.properties.push({
          name: 'overrides',
          targetTypeNames: ['RequestInit'],
        } as TypeScalar);

        const statusCodes = Object.getOwnPropertyNames(responses).sort();
        // TODO: pick 'default' if it exists; otherwise pick lowest status code e.g. '200'
        const statusCode0 = statusCodes.includes('default')
          ? 'default'
          : statusCodes[0];
        const responseObj0 = responses[statusCode0];

        const defaultResponseBody: TypeClass = {
          name: responseBodyModelName,
          properties: [],
        };
        let responseBodyModel: ResponseBodyModel = defaultResponseBody;
        if (oa3.isReferenceObject(responseObj0)) {
          c.debug(
            'makeOperations PATH',
            path,
            'METHOD',
            httpMethod,
            'response REF',
          );
          const resBodyRef = this.makeModelFromReference(responseObj0.$ref);
          responseBodyModel = resBodyRef.model;
          responseBodyModelName = resBodyRef.modelName;
        } else {
          c.debug(
            'makeOperations PATH',
            path,
            'METHOD',
            httpMethod,
            'response SCHEMA',
          );
          const resBodyRef = this.makeModelFromResponseBody(
            responseBodyModelName,
            responseObj0,
          );
          responseBodyModel = resBodyRef.model;
        }

        const requestModel: RequestModel = {
          modelName: requestModelName,
          httpMethod,
          operationId,
          pathParamsModel,
          queryParamsModel,
          headerParamsModel,
          cookieParamsModel,
          bodyModel: requestBodyModel,
        };

        requestModelToRegister.requestModel = requestModel;

        const operation: OperationModel = {
          httpMethod,
          operationId,
          description,
          request: requestModel,
          responseBody: responseBodyModel,
        };
        this.operationList.push(operation);
        this.pathList.push(
          `  ${operationId}: new PathMaker('${path}', [${pathParamsStr}]),`,
        );
        //c.debug('makeOperations path', path, 'method', httpMethod, 'op ready', operation);
      }
    }
  }

  makeModelFromParamsInLocation(
    name: string,
    params: oa3.ParameterObjectArray,
    location: string,
  ): TypeModel | null {
    c.debug(' + makeModelFromParamsInLocation', name, location);
    const paramContainerModel: TypeModel = { name, properties: [] }; // e.g. RequestHeaderParamsModel
    this.setType(name, paramContainerModel); // register ASAP!

    let modelExtension = '';
    if (['path', 'header'].includes(location))
      modelExtension = TypeName_ObjectWithStringProps;

    params.forEach((param) => {
      let paramObj: oa3.ParameterObject;
      const isProp = true;
      let required = false;

      if (oa3.isReferenceObject(param)) {
        // REF * * *
        const deepSource = this.getTypeSourceByRef(param.$ref);
        if (deepSource.isParamObj && deepSource.paramObj) {
          const parRef = this.makeModelFromReference(param.$ref);
          paramObj = deepSource.paramObj;
          if (paramObj.in !== location) return; // skip this param
          if (!paramObj.schema)
            throw new Error(
              'param ref deep source has no schema: ' + param.$ref,
            );
          required = paramObj.required ?? false;
          const prop: TypeScalar = {
            name: paramObj.name,
            targetTypeNames: [parRef.model.name],
            isProp,
            required,
            rawSource: paramObj,
          };
          paramContainerModel.properties.push(prop);
        } else {
          throw new Error(
            'parameter ref is not referring to a parameter object: ' +
              param.$ref,
          );
        }
      } else {
        // CUSTOM SCHEMA definition ?

        paramObj = param;
        if (paramObj.in !== location) return; // skip this param
        if (!paramObj.schema)
          throw new Error('param has no schema: ' + paramObj.name);
        required = paramObj.required ?? false;

        const schemaOrRef = paramObj.schema;
        if (oa3.isReferenceObject(schemaOrRef)) {
          // REF * * *
          const parRef = this.makeModelFromReference(schemaOrRef.$ref);
          const prop: TypeScalar = {
            name: paramObj.name,
            targetTypeNames: [parRef.model.name],
            isProp,
            required,
            rawSource: paramObj.schema,
          };
          paramContainerModel.properties.push(prop);
        } else {
          const paramModelName = 'Param' + pruneParamName(paramObj.name);
          const parModel = this.makeModelFromSchema(
            paramModelName,
            paramObj.schema,
          );
          const prop: TypeScalar = {
            name: paramObj.name,
            targetTypeNames: [parModel.name],
            isProp,
            required,
            rawSource: paramObj.schema,
          };
          paramContainerModel.properties.push(prop);
        }
      }
    });

    if (paramContainerModel.properties.length) {
      if (modelExtension && isInstanceOfTypeClass(paramContainerModel)) {
        paramContainerModel.extendModelName = modelExtension;
      }
      const model = paramContainerModel; // registered above
      c.debug(
        ' ++ makeModelFromParamsInLocation',
        name,
        location,
        '==>',
        model,
      );
      return model;
    }

    // remove registered model without props
    this.delType(name);

    return null; // no params found
  }

  getTypeSourceByRef(ref: string): TypeSource {
    if (ref.trim() === '') throw new Error('ref empty');
    const refArr: string[] = ref.replace('#/components/', '').split('/');
    const [section, name] = refArr;
    const {
      schemas = {},
      parameters = {},
      headers = {},
      requestBodies = {},
      responses = {},
    } = this.rawApi.components ?? {};

    let source = this.getTypeSource(ref);
    if (source) return source;

    switch (section) {
      case COMP_SECTION_SCHEMAS:
        const refOrSchemaObj = schemas?.[name] ?? null;
        if (!refOrSchemaObj) throw new Error('schema not found: ' + ref);
        if (oa3.isReferenceObject(refOrSchemaObj)) {
          source = { isRef: true, refObj: refOrSchemaObj };
        } else {
          source = { isSchemaObj: true, schemaObj: refOrSchemaObj };
        }
        break;

      case COMP_SECTION_PARAMS:
        const refOrParamObj = parameters?.[name] ?? null;
        if (!refOrParamObj) throw new Error('parameter not found: ' + ref);
        if (oa3.isReferenceObject(refOrParamObj)) {
          source = { isRef: true, refObj: refOrParamObj };
        } else {
          source = { isParamObj: true, paramObj: refOrParamObj };
        }
        break;

      case COMP_SECTION_HEADERS:
        const refOrHeaderObj = headers?.[name] ?? null;
        if (!refOrHeaderObj) throw new Error('header not found: ' + ref);
        if (oa3.isReferenceObject(refOrHeaderObj)) {
          source = { isRef: true, refObj: refOrHeaderObj };
        } else {
          source = { isHeaderObj: true, headerObj: refOrHeaderObj };
        }
        break;

      case COMP_SECTION_REQUESTS:
        const refOrRequestBodyObj = requestBodies?.[name] ?? null;
        if (!refOrRequestBodyObj)
          throw new Error('request body not found: ' + ref);
        if (oa3.isReferenceObject(refOrRequestBodyObj)) {
          source = { isRef: true, refObj: refOrRequestBodyObj };
        } else {
          source = {
            isRequestBodyObj: true,
            requestBodyObj: refOrRequestBodyObj,
          };
        }
        break;

      case COMP_SECTION_RESPONSES:
        const refOrResponseObj = responses?.[name] ?? null;
        if (!refOrResponseObj) throw new Error('response not found: ' + ref);
        if (oa3.isReferenceObject(refOrResponseObj)) {
          source = { isRef: true, refObj: refOrResponseObj };
        } else {
          source = { isResponseObj: true, responseObj: refOrResponseObj };
        }
        break;

      default:
        break;
    }

    if (!source) throw new Error('source not found: ' + ref); // another invalid ref

    return this.setTypeSource(ref, source); // cache
  }

  templateHeader(ts: string, description: string = ''): string {
    const infoLine =
      'generated by ApolloRestDataSourceGenerator' +
      (this.createdAtOff ? '' : ` at ${ts}`);
    return `/**
 * ${description}
 * 
 * ${infoLine}
 */

import { IApiRequest, PathMaker, BaseRestDataSource } from '@common-utils/graphql-shared';
export interface ObjectWithNoPropsDefined { [prop: string]: any; }
export interface ObjectWithStringProps    { [prop: string]: string; }

`;
  }

  templatePathList(): string {
    return `
export const PATHS = {
${this.pathList.join('\n')}
};
`;
  }

  templateApiClassStart(): string {
    const apiClassName = `${this.serviceName}RestDataSource`;
    return `
/**
 * ${this.rawApi.info.title} (version ${this.rawApi.info.version})
 */
export class ${apiClassName} extends BaseRestDataSource {

  constructor(
    serviceBaseURL: string,
  ) {
    super(serviceBaseURL);
  }
`;
  }

  templateApiClassMethods(): string {
    return this.operationList.map(this.templateApiClassMethod).join('\n');
  }

  templateApiClassMethod(op: OperationModel): string {
    const {
      operationId,
      description = null,
      httpMethod,
      request,
      responseBody,
    } = op;
    const query = request.queryParamsModel ? 'request.params()' : 'null';
    const body = request.bodyModel ? 'request.body()' : 'null';
    const data = ['get', 'delete'].includes(httpMethod) ? query : body;
    const comment = description ? `\n  /**\n   * ${description}\n   */\n` : '';
    return `${comment}  async ${operationId}(request: ${request.modelName}): Promise<${responseBody.name}> {
    return this.${httpMethod}<${responseBody.name}>(request.path(), ${data}, request.options());
  }`;
  }

  templateTypeRequestModel(request: RequestModel) {
    const pathParamsModelName = request.pathParamsModel?.name ?? 'null';
    const queryParamsModelName = request.queryParamsModel?.name ?? 'null';
    const bodyModelName = request.bodyModel?.name ?? 'null';
    const isJsonMethod = request.bodyModel
      ? '\n  protected isJson(): boolean { return true; }\n'
      : '';

    return `
export class ${request.modelName} extends IApiRequest<${pathParamsModelName}, ${queryParamsModelName}, ${bodyModelName}> {
  protected pathMaker(): PathMaker { return PATHS.${request.operationId}; }${isJsonMethod}
}
`;
  }

  templateTypeClass(t: TypeClass) {
    const props = t.properties.map(this.templateClassProp).join('\n');
    const extension = t.extendModelName ? ' extends ' + t.extendModelName : '';
    const comment = t.description ? `\n/**\n * ${t.description}\n */\n` : '';

    return `${comment}export interface ${t.name}${extension} {
${props}
}
`;
  }

  templateTypeArray(t: TypeArray) {
    const comment = t.description ? `\n/**\n * ${t.description}\n */\n` : '';
    const item = t.itemsModel?.name ?? ''; // it is actually required
    return `${comment}export type ${t.name} = Array<${item}>;`;
  }

  templateClassProp(t: TypeScalar) {
    const description = t.description ?? '';
    const format = t.format ? `format: "${t.format}"` : '';
    const pattern = t.pattern ? `pattern: "${t.pattern}"` : '';
    const comment = makeComment({
      description,
      format,
      pattern,
      options: { indent: '  ', prefix: '\n', suffix: '\n' },
    });
    const pName = /[-|\s|.|"|']/.test(t.name) ? `"${t.name}"` : t.name;
    const q = t.required ? '' : '?';
    const j = t.joinTypes ?? '|';
    const n = t.nullable ? ' | null' : '';
    const types = t.targetTypeNames.join(` ${j} `) + n;
    return `${comment}  ${pName}${q}: ${types};`;
  }

  templateApiClassEnd(): string {
    return `
}
`;
  }

  templateTypes(): string {
    return Object.getOwnPropertyNames(this.typeMap)
      .map((name) => {
        const t = this.typeMap[name];
        if (isInstanceOfTypeClass(t)) {
          if (t.isRequest && t.requestModel)
            return this.templateTypeRequestModel(t.requestModel);
          return this.templateTypeClass(t);
        }
        if (isInstanceOfTypeArray(t)) return this.templateTypeArray(t);
        if (isInstanceOfTypeScalar(t)) return this.templateTypeScalar(t);
        if (isInstanceOfTypeEnum(t)) return this.templateTypeEnum(t);
        c.error('no template to render model', t);
        return '';
      })
      .join('\n\n');
  }

  templateTypeScalar(t: TypeScalar) {
    const description = t.description ?? '';
    const format = t.format ? `format: "${t.format}"` : '';
    const pattern = t.pattern ? `pattern: "${t.pattern}"` : '';
    const comment = makeComment({
      description,
      format,
      pattern,
      options: { indent: '', prefix: '\n', suffix: '\n' },
    });
    const j = t.joinTypes ?? '|';
    return `${comment}export type ${t.name} = ${t.targetTypeNames.join(
      ` ${j} `,
    )};`;
  }

  templateTypeEnum(t: TypeEnum) {
    const { name, description = '', enumValues = [], typeName = null } = t;
    // const line1 = description ? `${description.split('*').map(s => s.trim()).filter(s => s !== '').join('\n * ')}` : null;
    const line1 = ''; // no need, we have enum data lookup list now
    const line2 = typeName ? `\n * type: ${typeName}` : null;
    const comment = line2 ? `/**\n * ${line1}${line2}\n */\n` : '';
    const kvPairs = enumValues
      .map(({ key, value }) => {
        const vStr = typeName === 'string' ? `"${value}"` : String(value); // show value acc. to typeName
        return `  ${key} = ${vStr},`;
      })
      .join('\n');

    const dataLookupList = makeEnumDataLookupList(enumValues, description);
    const dataLookupListStr = dataLookupList
      .map(({ id, label }) => `  { id: "${id}", label: "${label}" },`)
      .join('\n');

    return `${comment}export enum ${name} {
${kvPairs}
}

export const ENUM_DATA_${name} = [
${dataLookupListStr}
];`;
  }

  templateFooter(): string {
    return '';
  }
} // end class

export function isScalarType(t: string): boolean {
  return TYPE_SCALARS.includes(t);
}

/**
 * Convert $ref path to key to be used in model map
 * @param {string} refPath
 * @returns {string}
 */
export function refPathToName(refPath: string): string {
  
  // TODO for now assume name is unique

  const name = refPath
    .replace('#/components/', '')
    .replace('schemas', '')
    .replace('requestBodies/', '')
    .replace(
      /responses\/([0-9])(.*)/,
      (match, p1, p2) => 'responses/Response' + p1 + p2,
    ) // 'responses/400' => 'responses/Response400'
    .replace('responses', '')
    .replace('parameters', 'Param')
    .split('/')
    .filter((w) => !!w)
    .map(pruneParamName)
    .join('');

  return name;
}

export type TypeRawSourceObj =
  | oa3.ReferenceObject
  | oa3.SchemaObject
  | oa3.ParameterObject
  | oa3.RequestBodyObject
  | oa3.ResponseObject;

export interface TypeSource {
  isRef?: true;
  refObj?: oa3.ReferenceObject;

  isSchemaObj?: true;
  schemaObj?: oa3.SchemaObject;

  isParamObj?: true;
  paramObj?: oa3.ParameterObject;

  isHeaderObj?: true;
  headerObj?: oa3.HeaderObject;

  isRequestBodyObj?: true;
  requestBodyObj?: oa3.RequestBodyObject;

  isResponseObj?: true;
  responseObj?: oa3.ResponseObject;
}

export interface TypeSourceMap {
  [name: string]: TypeSource;
}

export interface TypeBase {
  name: string;
  description?: string;
  required?: boolean;
  nullable?: boolean;
  allOf?: string[]; // export type A = A1 & A2 & A3;
  anyOf?: string[]; // export type B = B1 | B2 | B3;

  isSchema?: true;
  isProp?: true;
  isParam?: true;
  isRequestBody?: true;
  isResponseBody?: true;

  rawSource?: TypeRawSourceObj;
}
export interface TypeScalar extends TypeBase {
  targetTypeNames: string[]; // 'string' also 'ModelA | ModelB' using $ref or anyOf
  joinTypes?: '|' | '&'; // default to '|'
  format?: oa3.ObjectFormatOptions;
  pattern?: string;
}
export interface TypeEnumKeyValuePair {
  key: string;
  value: string;
}
export interface TypeEnum extends TypeBase {
  typeName?: string;
  enumValues: TypeEnumKeyValuePair[];
}
export interface TypeClass extends TypeBase {
  properties: TypeScalar[]; // TypeModel[]; // TODO we don't want to have complex types for props
  requiredPropNames?: string[];
  extendModelName?: string;
  // we need more info about request
  isRequest?: boolean;
  requestModel?: RequestModel;
}
export interface TypeArray extends TypeBase {
  itemsModel?: TypeModel; // prop optional for easy fast registration, but required
}
export type TypeModel = TypeScalar | TypeEnum | TypeClass | TypeArray;
export interface TypeModelMap {
  [name: string]: TypeModel;
}
export function isInstanceOfTypeScalar(obj: TypeModel): obj is TypeScalar {
  return (obj as TypeScalar).targetTypeNames !== undefined;
}
export function isInstanceOfTypeEnum(obj: TypeModel): obj is TypeEnum {
  return (obj as TypeEnum).enumValues !== undefined;
}
export function isInstanceOfTypeClass(obj: TypeModel): obj is TypeClass {
  return (obj as TypeClass).properties !== undefined;
}
export function isInstanceOfTypeArray(obj: TypeModel): obj is TypeArray {
  return (obj as TypeArray).itemsModel !== undefined;
}
export interface TypeMakeModelOutput {
  modelName: string;
  model: TypeModel;
  source?: TypeSource;
  isRef?: boolean;
}

export interface RequestModel {
  modelName: string;
  description?: string;
  operationId: string;
  httpMethod: string;
  headerParamsModel?: TypeModel | null;
  queryParamsModel?: TypeModel | null;
  pathParamsModel?: TypeModel | null;
  cookieParamsModel?: TypeModel | null;
  bodyModel?: TypeModel | null;
}

export type ResponseBodyModel = TypeModel;

export interface ResponseModel {
  modelName: string;
  description?: string;
  headerParams?: TypeModelMap;
  bodyModelName?: string;
}

export interface OperationModel {
  description?: string;
  operationId: string;
  httpMethod: string;
  request: RequestModel;
  response?: ResponseModel;
  responseBody: ResponseBodyModel;
}

export function isHeaderObject(
  headerObj: oa3.HeaderObject | oa3.ReferenceObject,
): headerObj is oa3.HeaderObject {
  return !headerObj.hasOwnProperty('$ref'); // basic check for now
}
export function isRequestBodyObject(
  requestBodyObj: oa3.RequestBodyObject | oa3.ReferenceObject,
): requestBodyObj is oa3.RequestBodyObject {
  return !requestBodyObj.hasOwnProperty('$ref'); // basic check for now
}
export function isParameterObject(
  paramObj: oa3.ParameterObject | oa3.ReferenceObject,
): paramObj is oa3.ParameterObject {
  return !paramObj.hasOwnProperty('$ref'); // basic check for now
}

export const patternStartingWithDigit = /^\d/;
export const patternReplaceChars = /[^a-zA-Z0-9_]/g;

export function makeEnumKeyValuePair(
  value: string,
  prefix = '_',
): TypeEnumKeyValuePair {
  const valueForKey = value.replace(patternReplaceChars, '_');
  let key = valueForKey.toUpperCase();
  if (patternStartingWithDigit.test(valueForKey))
    key = `${prefix}${valueForKey}`;
  return { key, value };
}

export function makeEnumDataLookupList(
  enumValues: TypeEnumKeyValuePair[],
  description = '',
): IdLabelPair[] {
  let dataLookupList: IdLabelPair[] = enumValues.map((kv) => ({
    id: kv.value,
    label: kv.value,
  }));
  if (description && description !== '') {
    const idLabelList = makeIdLabelPairs(description);
    if (idLabelList.length) {
      dataLookupList = idLabelList;
      const idList = idLabelList.map(({ id }) => id);
      // for int. dialing codes there may be more than 1 labels for one code
      enumValues.forEach((kv) => {
        if (!idList.includes(kv.value)) {
          // handle discrepancy
          dataLookupList.push({ id: kv.value, label: kv.value });
        }
      });
    }
  }
  return dataLookupList;
}

export interface MakeCommentInput {
  description?: string;
  format?: string;
  pattern?: string;
  options?: {
    indent?: string;
    prefix?: string;
    suffix?: string;
  };
}

export function makeComment(input: MakeCommentInput) {
  const { description = '', format = '', pattern = '', options = {} } = input;
  const { indent = '', prefix = '', suffix = '' } = options;
  const commentLines = [description, format, pattern]
    .filter((c) => c !== '')
    .map((c) => c.split(' *').join(`\n${indent} * `))
    .map((c) => indent + ' * ' + c);
  if (commentLines.length) {
    return `${prefix}${indent}/**
${commentLines.join('\n')}
${indent} */${suffix}`;
  }
  return '';
}

export interface IdLabelPair {
  id: string;
  label: string;
  description?: string; // room for additional props but no way of auto-generating extra props
  invalid?: boolean;
}

/**
 * sample input:
 *   "* Change of Name = 1 * Change of Address = 2 * Deceased = 3 *\
 *   \ Change of Restrictive Status = 4 * Change of Service Need = 5 * KYC Update\_\
 *   \ = 6 * Country Associations = 7 * Bankruptcy Notification  = 8 * Court Order\
 *   \ Notification = 9 * Legal Hold Notification = 10 * POA Relationship = 11\
 *   \ * Change of Date of Birth =12"
 *
 * @param desc
 */
export function makeIdLabelPairs(desc: string): IdLabelPair[] {
  if (!desc.includes('*')) return []; // it does not look like what we are expecting
  return desc
    .split('*')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map(makeIdLabelPair)
    .filter((pair) => !(pair?.invalid ?? false));
}

// match enum comment line "Marketing Consents = 1"
// match enum comment line "Virgin Islands (British) =   VGB"
const ENUM_PAIR_PATTERN1 = /^(.+)=(.+)$/;

// match enum comment line "Australian Antarctic Territory (+672 1)"
// match enum comment line "Zanzibar(+255 24)"
const ENUM_PAIR_PATTERN2 = /^(.+)\((\+\d+\s\d+)\)$/;

// match enum comment line "United Kingdom (+44)"
const ENUM_PAIR_PATTERN3 = /^(.+)\((\+\d+)\)$/;

const ENUM_PAIR_PATTERNS = [
  ENUM_PAIR_PATTERN1,
  ENUM_PAIR_PATTERN2,
  ENUM_PAIR_PATTERN3,
];

export function makeIdLabelPair(line: string): IdLabelPair {
  let label = '',
    id = '',
    invalid = true,
    matches: string[] | null;
  for (let pattern of ENUM_PAIR_PATTERNS) {
    matches = line.match(pattern);
    if (matches && matches.length === 3) {
      label = String(matches[1]).trim();
      id = String(matches[2]).trim();
      invalid = false;
      break;
    }
  }
  return { label, id, invalid };
}

export function pruneParamName(str: string) {
  return String(str).split('-').map(firstLetterUp).join('');
}

export function firstLetterUp(str: string) {
  return String(str)[0].toUpperCase() + String(str).slice(1);
}
