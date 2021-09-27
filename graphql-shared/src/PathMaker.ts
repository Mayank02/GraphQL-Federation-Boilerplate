import { IFlatObject } from './commonTypes';
export class PathMaker {
  constructor(public path: string, public paramKeysRequired: string[] = []) {
    // ok
  }

  value(params: IFlatObject = {}): string {
    return PathMaker.pathParser(this.path, this.paramKeysRequired, params);
  }

  static pathParser(
    path: string,
    paramKeysRequired: string[],
    params: IFlatObject,
  ): string {
    let pathModified = path;
    const inputParamKeys = Object.getOwnPropertyNames(params);
    paramKeysRequired.forEach((k) => {
      let paramValueEnc = '';
      if (params) {
        if (inputParamKeys.includes(k)) {
          if (typeof params[k] === 'number' || params[k]) {
            paramValueEnc = String(params[k]);
          }
          paramValueEnc = paramValueEnc.trim();
        }
      }
      if (paramValueEnc === '') {
        throw new Error(`path ${path} parameter not found: ${k}`);
      }
      paramValueEnc = encodeURIComponent(String(params[k]));
      const placeHolder = `{${k}}`;
      pathModified = pathModified.replace(placeHolder, paramValueEnc);
    });
    if (pathModified === '') {
      throw new Error('path should not be blank');
    }
    return pathModified;
  }
}
