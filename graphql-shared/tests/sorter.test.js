
const { Sorter } = require('../src/Sorter')
const { ErrorEnum } = require('../src/ErrorEnum');

describe('Sorter tests', () => {
    const testNumberArray = [{
        items: {
            item: 1
        }
    }, {
        items: {
            item: 3
        }
    }, {
        items: {
            item: 2
        }
    }];

    const testStringArray = [{
        items: {
            item: 'B1'
        }
    }, {
        items: {
            item: 'X1'
        }
    }, {
        items: {
            item: '2B'
        },
    }, {
        items: {
            item: 'A1'
        },
    }, {
        items: {
            item: 'A2'
        },
    }, {
        items: {
            item: '3A'
        },
    }];

    const testDateArray = [{
        items: {
            item: '2020-03-20T00:00:00.000z'
        }
    }, {
        items: {
            item: '2021-01-12T00:00:00.000z'
        }
    }, {
        items: {
            item: '2021-01-11T00:00:00.000z'
        },
    }];

    function prepSortItemOpenDate(item) {
        return item.items.item;
    }

    const sorter = new Sorter();


    test('numberSort ASC', () => {

        const result = sorter.numberSort(testNumberArray, prepSortItemOpenDate, "ASC")

        expect(result).toEqual([{
            items: {
                item: 1
            }
        }, {
            items: {
                item: 2
            }
        }, {
            items: {
                item: 3
            }
        }]);

    });

    test('numberSort DESC', () => {

        const result = sorter.numberSort(testNumberArray, prepSortItemOpenDate, "DESC")

        expect(result).toEqual([{
            items: {
                item: 3
            }
        }, {
            items: {
                item: 2
            }
        }, {
            items: {
                item: 1
            }
        }]);

    });

    test('stringSort String ASC', () => {

        const result = sorter.stringSort(testStringArray, prepSortItemOpenDate, "ASC")

        expect(result).toEqual([{
            items: {
                item: "A1"
            }
        }, {
            items: {
                item: "A2"
            }
        }, {
            items: {
                item: "B1"
            }
        }, {
            items: {
                item: "X1"
            }
        }, {
            items: {
                item: "2B"
            }
        }, {
            items: {
                item: "3A"
            }

        }]);

    });

    test('stringSort String DESC', () => {


        const result = sorter.stringSort(testStringArray, prepSortItemOpenDate, "DESC")

        expect(result).toEqual([{
            items: {
                item: "3A"
            }
        }, {
            items: {
                item: "2B"
            }
        }, {
            items: {
                item: "X1"
            }
        }, {
            items: {
                item: "B1"
            }
        }, {
            items: {
                item: "A1"
            }
        }, {
            items: {
                item: "A2"
            }
        }]);

    });

    test('dateSort ASC', () => {

        const result = sorter.dateSort(testDateArray, prepSortItemOpenDate, "ASC")

        expect(result).toEqual([{
            items: {
                item: '2020-03-20T00:00:00.000z'
               
            }
        }, {
            items: {
                item: '2021-01-11T00:00:00.000z'
            }
        }, {
            items: {
                item: '2021-01-12T00:00:00.000z'
            },
        }]);

    });

    test('dateSort DESC', () => {


        const result = sorter.dateSort(testDateArray, prepSortItemOpenDate, "DESC")

        expect(result).toEqual([{
            items: {
                item: '2021-01-12T00:00:00.000z'
            }
        }, {
            items: {
                item: '2021-01-11T00:00:00.000z'
            }
        }, {
            items: {
                item: '2020-03-20T00:00:00.000z'
            },
        }]);


    });

    test('getSorted typeError', () => {

        expect.assertions(2);

        const wrongTypeError = [{
            items: {
                item: false
            }
        }, {
            items: {
                item: true
            }
        }, {
            items: {
                item: false
            }
        }]


        try {
            sorter.stringSort(wrongTypeError, prepSortItemOpenDate, "")
        } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError)
            expect(error).toHaveProperty('message', ErrorEnum.SORT_GENERAL_FAILURE)
        }

    });

});

