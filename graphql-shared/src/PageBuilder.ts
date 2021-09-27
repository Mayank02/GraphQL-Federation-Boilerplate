import {
  PageDataCursor,
  PaginationInput,
  OffsetPaginationInput,
  PageForOffset,
  PageForCursor,
  PageInfo,
} from './commonTypes';
import { UserInputError } from 'apollo-server-errors';

/* 
Pagination class taking 
*/
export class PageBuilder<T> {
  pageSource: Array<T>;
  cursorPaginationInfo: PaginationInput;
  offsetPaginationInfo: OffsetPaginationInput;
  getSourceForCursorFunction: Function;
  forward: boolean = false;
  isInputValidated: boolean = false;
  isCursorPagination: boolean = false;

  /*  
  Takes in either cursor based pagination object or offset based pagination input
  Cursor
  @paginationInfo = {  first?: number;
          after?: string;
          last?: number;
          before?: string;
        }
  Offset
  @paginationInfo {
     offset: number;
     limit: number;
  }
  */
  constructor(paginationInfo: PaginationInput | OffsetPaginationInput) {
    const isOffsetPaginationInfo = (
      variableToCheck: PaginationInput | OffsetPaginationInput,
    ): variableToCheck is OffsetPaginationInput =>
      (variableToCheck as OffsetPaginationInput).limit !== undefined;

    if (isOffsetPaginationInfo(paginationInfo)) {
      this.offsetPaginationInfo = paginationInfo;
    } else {
      this.cursorPaginationInfo = paginationInfo;
      this.isCursorPagination = true;
    }
  }

  public encodeCursor(cursor: string): string {
    let buff = Buffer.from(cursor);
    return buff.toString('base64');
  }

  public decodeCursor(cursor: string): string {
    let buff = Buffer.from(cursor, 'base64');
    return buff.toString('utf8');
  }

  /*  
      Pagination glass used for cursor and offset pagination. Return an object:
    {pageInfo: {
        hasNextPage: is there a next page,
        hasPreviousPage: is there a prevouse,
        startCursor: start cursor 64 encoded,
        endCursor: end cursor 64 encoded,
        totalNumber: total number of records from api
      },
      edges: [
        {
          cursor: current object currsor,
          node: {
            your paginated object...
          }
        }
      ]
    }

    or in offset case 
  {   pageData {
        [
          your paginated objects...
        ]
    }
    totalNumber: total number of records from api
  }
  */

  public getPage(pageSource: Array<T>): PageForOffset<T>;
  public getPage(
    pageSource: Array<T>,
    findItemFunction: Function,
  ): PageForCursor<T>;
  public getPage(
    pageSource: Array<T>,
    findItemFunction?: Function,
  ): PageForCursor<T> | PageForOffset<T> {
    if (!this.isInputValidated) {
      this.validateInput();
    }
    this.pageSource = pageSource;
    return this.isCursorPagination
      ? this.getPageForCursor(findItemFunction)
      : this.getPageForOffset();
  }

  private getPageForCursor(getSourceForCursor: Function): PageForCursor<T> {
    this.getSourceForCursorFunction = getSourceForCursor;
    let pageData: PageDataCursor<T>;

    pageData = this.forward ? this.getNextPage() : this.getPreviousPage();

    const edges = pageData.page.map((item) => {
      return {
        cursor: this.encodeCursor(getSourceForCursor(item)),
        node: item,
      };
    });
    const pageInfo: PageInfo = {
      hasPreviousPage: pageData.hasPrev,
      hasNextPage: pageData.hasNext,
      startCursor: edges.length > 0 ? edges[0].cursor : '',
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : '',
      totalNumber: this.pageSource.length,
    };
    return {
      edges,
      pageInfo,
    };
  }

  private getPageForOffset(): PageForOffset<T> {
    if (this.offsetPaginationInfo.offset >= this.pageSource.length) {
      return {
        pageData: [],
        totalNumber: this.pageSource.length,
      };
    }
    return {
      pageData: this.pageSource.slice(
        this.offsetPaginationInfo.offset,
        this.offsetPaginationInfo.offset + this.offsetPaginationInfo.limit,
      ),
      totalNumber: this.pageSource.length,
    };
  }

  public validateInput() {
    let isInputValid: boolean = false;
    isInputValid = this.isCursorPagination
      ? this.isCursorInputValid()
      : this.isOffsetInputValid();
    if (!isInputValid) {
      throw new UserInputError('Wrong pagination data provided');
    }
    this.isInputValidated = true;
    return this;
  }

  private isCursorInputValid(): boolean {
    if (
      typeof this.cursorPaginationInfo.first === 'number' &&
      this.cursorPaginationInfo.first > 0 &&
      typeof this.cursorPaginationInfo.last === 'undefined' &&
      typeof this.cursorPaginationInfo.before === 'undefined' &&
      this.cursorPaginationInfo.after !== null
    ) {
      this.forward = true;
      return true;
    }

    if (
      typeof this.cursorPaginationInfo.last === 'number' &&
      this.cursorPaginationInfo.last > 0 &&
      typeof this.cursorPaginationInfo.first === 'undefined' &&
      typeof this.cursorPaginationInfo.after === 'undefined' &&
      this.cursorPaginationInfo.before !== null
    ) {
      return true;
    }
    return false;
  }

  private isOffsetInputValid(): boolean {
    if (
      typeof this.offsetPaginationInfo.offset === 'number' &&
      this.offsetPaginationInfo.offset >= 0 &&
      typeof this.offsetPaginationInfo.limit === 'number' &&
      this.offsetPaginationInfo.limit >= 1
    ) {
      return true;
    }
    return false;
  }

  private getNextPage(): PageDataCursor<T> {
    let hasNext = false;
    let hasPrev = false;
    if (typeof this.cursorPaginationInfo.after !== 'undefined') {
      let index = this.getCursorIndex(this.cursorPaginationInfo.after) + 1;
      if (index === 0 || index === this.pageSource.length) {
        throw new UserInputError('Wrong pagination data provided');
      }
      hasNext =
        this.pageSource.length > this.cursorPaginationInfo.first + index;
      hasPrev = true;
      return {
        page: this.pageSource.slice(
          index,
          index + this.cursorPaginationInfo.first,
        ),
        hasNext,
        hasPrev,
      };
    }
    hasNext = this.pageSource.length > this.cursorPaginationInfo.first;
    return {
      page: this.pageSource.slice(0, this.cursorPaginationInfo.first),
      hasNext,
      hasPrev,
    };
  }

  private getPreviousPage(): PageDataCursor<T> {
    let hasNext = false;
    let hasPrev = false;
    if (typeof this.cursorPaginationInfo.before !== 'undefined') {
      let index = this.getCursorIndex(this.cursorPaginationInfo.before);
      if (index < 1) {
        throw new UserInputError('Wrong pagination data provided');
      }
      hasNext = true;
      hasPrev = index > this.cursorPaginationInfo.last;
      return {
        page: hasPrev
          ? this.pageSource.slice(index - this.cursorPaginationInfo.last, index)
          : this.pageSource.slice(0, index),
        hasNext,
        hasPrev,
      };
    }
    hasPrev = this.pageSource.length > this.cursorPaginationInfo.last;
    return {
      page: hasPrev
        ? this.pageSource.slice(
            this.pageSource.length - this.cursorPaginationInfo.last,
          )
        : this.pageSource,
      hasNext,
      hasPrev,
    };
  }

  private getCursorIndex(cursor: string): number {
    return this.pageSource.findIndex(
      (pageItem) =>
        this.getSourceForCursorFunction(pageItem) === this.decodeCursor(cursor),
    );
  }
}
