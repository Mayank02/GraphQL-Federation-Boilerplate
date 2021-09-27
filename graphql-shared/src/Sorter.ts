import { OrderDirectionEnum } from './commonTypes';
import { ErrorEnum } from './ErrorEnum';

/* 
A Class for simple sorting does not have any initialisation parameters
*/

export class Sorter {
  /* 
    Used for: sorting numbers
    @arrayToOrder - array of object that you want to order
    @itemFunction - a funtion which returns the field you wnat to apply sorting on
    @order - order for sorting "ASC" or "DESC"
    returns - arrayToOrder with new order
  */
  numberSort<T>(
    arrayToOrder: Array<T>,
    itemFunction: Function,
    order: OrderDirectionEnum,
  ): Array<T> {
    try {
      arrayToOrder = arrayToOrder.sort((itemA, itemB) => {
        let a = itemFunction(itemA);
        let b = itemFunction(itemB);
        if (order == OrderDirectionEnum.DESC) {
          return b - a;
        }
        if (order == OrderDirectionEnum.ASC) {
          return a - b;
        }
      });
    } catch (error) {
      throw new SyntaxError(ErrorEnum.SORT_GENERAL_FAILURE);
    }
    return arrayToOrder;
  }

  /* 
    Used for: sorting alphanumeric strings, with numbers going first in order followed by string
    @arrayToOrder - array of object that you want to order
    @itemFunction - a funtion which returns the field you wnat to apply sorting on
    @order - order for sorting "ASC" or "DESC"
    returns - arrayToOrder with new order
  */
  stringSort<T>(
    arrayToOrder: Array<T>,
    itemFunction: Function,
    order: OrderDirectionEnum,
  ): Array<T> {
    try {
      let regChars = /[^a-zA-Z]/g;
      let regNums = /[^0-9]/g;
      const emptyStr = '';
      arrayToOrder = arrayToOrder.sort((itemA, itemB) => {
        let a = itemFunction(itemA);
        let b = itemFunction(itemB);
        let charsA = a.replace(regChars, emptyStr);
        let charsB = b.replace(regChars, emptyStr);
        var nummericA = parseInt(a.replace(regNums, emptyStr), 10);
        var numericB = parseInt(b.replace(regNums, emptyStr), 10);
        if (order == OrderDirectionEnum.ASC) {
          if (isNaN(parseInt(a[0]))) {
            return charsA === charsB
              ? 0
              : charsA.localeCompare(charsB) == 1
              ? 1
              : -1;
          } else {
            return nummericA === numericB ? 0 : nummericA > numericB ? 1 : -1;
          }
        }
        if (order == OrderDirectionEnum.DESC) {
          if (isNaN(parseInt(a[0]))) {
            return charsA === charsB
              ? 0
              : charsA.localeCompare(charsB) == 1
              ? -1
              : 1;
          } else {
            return nummericA === numericB ? 0 : nummericA < numericB ? 1 : -1;
          }
        }
      });
    } catch (error) {
      throw new SyntaxError(ErrorEnum.SORT_GENERAL_FAILURE);
    }
    return arrayToOrder;
  }

  /* 
    Used for: date sorting, converts date to miliseconds and sorts as numbers
    @arrayToOrder - array of object that you want to order
    @itemFunction - a funtion which returns the field you wnat to apply sorting on
    @order - order for sorting "ASC" or "DESC"
    returns - arrayToOrder with new order
  */
  dateSort<T>(
    arrayToOrder: Array<T>,
    itemFunction: Function,
    order: OrderDirectionEnum,
  ): Array<T> {
    const newItemFunction = function (item) {
      return new Date(itemFunction(item)).getTime();
    };
    return this.numberSort(arrayToOrder, newItemFunction, order);
  }
}
