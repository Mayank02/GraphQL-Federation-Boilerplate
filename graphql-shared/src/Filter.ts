import { UserInputError } from 'apollo-server-express';
import {
  NumericFilterOperationsEnum,
  StringFilterOperationsEnum,
} from './commonTypes';
import { isStrValidDate } from './utils';
/* 
A Class for appling sorting
*/
export class Filter<I> {
  /* 
    Used for: filtering by string 
    @operation: "EQ" or "CONTAINS"
    @value: provided as input,
    @arrayToFilter: array of object to apply filtering on,
    @itemFunction: a funtion which returns the field you wnat to apply filtering on,
    returns - filtered arrayToFilter
  */
  doFilterString(
    operation: StringFilterOperationsEnum,
    value: string,
    arrayToFilter: Array<I>,
    itemFunction: Function,
  ): Array<I> {
    switch (operation) {
      case StringFilterOperationsEnum.EQ:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) == value;
        });
      case StringFilterOperationsEnum.CONTAINS:
        return arrayToFilter.filter((item) => {
          return itemFunction(item).includes(value);
        });
      default:
        throw new UserInputError('Bad filter operator input');
    }
  }

  /* 
    Used for: filtering by numbers 
    @operation: "EQ" or "LE" or "LT" or "GE"or "GT"
    @value: provided as input,
    @arrayToFilter: array of object to apply filtering on,
    @itemFunction: a funtion which returns the field you wnat to apply filtering on,
    returns - filtered arrayToFilter
  */
  doFilterNumber(
    operation: NumericFilterOperationsEnum,
    value: number,
    arrayToFilter: Array<I>,
    itemFunction: Function,
  ): Array<I> {
    switch (operation) {
      case NumericFilterOperationsEnum.EQ:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) == value;
        });
      case NumericFilterOperationsEnum.LE:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) <= value;
        });
      case NumericFilterOperationsEnum.LT:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) < value;
        });
      case NumericFilterOperationsEnum.GE:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) >= value;
        });
      case NumericFilterOperationsEnum.GT:
        return arrayToFilter.filter((item) => {
          return itemFunction(item) > value;
        });
      default:
        throw new UserInputError('Bad filter operator input');
    }
  }

  /* 
    Used for: filtering by date, in this case the hours minutes and secconds ar getting purged and filters on year month day
    @operation: "EQ" or "LE" or "LT" or "GE"or "GT"
    @value: provided as input,
    @arrayToFilter: array of object to apply filtering on,
    @itemFunction: a funtion which returns the field you wnat to apply filtering on,
    returns - filtered arrayToFilter
  */
  doFilterDate(
    operation: NumericFilterOperationsEnum,
    value: string,
    arrayToFilter: Array<I>,
    itemFunction: Function,
  ): Array<I> {
    const self = this;

    if (!isStrValidDate(value))
      throw new SyntaxError('Incorrect date provided for filtering');
    const newvalue: number = this.purgeTime(new Date(value)).getTime();

    const newItemFunction = function (item) {
      return self.purgeTime(new Date(itemFunction(item))).getTime();
    };

    return this.doFilterNumber(
      operation,
      newvalue,
      arrayToFilter,
      newItemFunction,
    );
  }

  purgeTime(date: Date): Date {
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    return date;
  }
}
