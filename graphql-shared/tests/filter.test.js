const { Filter } = require('../src/Filter')
const { ErrorEnum } = require('../src/ErrorEnum');

describe('Filter tests', () => {
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

    const filter = new Filter();

    test('doFilterString EQ', () => {

        const result = filter.doFilterString('EQ', 'X1', testStringArray, prepSortItemOpenDate)

        expect(result).toEqual([{
            items: {
                item: 'X1'
            }
        }])

    })

    test('doFilterString CONTAINS', () => {

        const result = filter.doFilterString('CONTAINS', '1', testStringArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: 'B1'
                }
            }, {
                items: {
                    item: 'X1'
                }
            }, {
                items: {
                    item: 'A1'
                },
            }]
        )

    })

    test('doFilterNumber EQ', () => {

        const result = filter.doFilterNumber('EQ', '1', testNumberArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: 1
                }
            }]
        )

    })

    test('doFilterNumber LE', () => {

        const result = filter.doFilterNumber('LE', '2', testNumberArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: 1
                }
            }, {
                items: {
                    item: 2
                }
            }]
        )

    })

    test('doFilterNumber LT', () => {

        const result = filter.doFilterNumber('LT', '2', testNumberArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: 1
                }
            }]
        )

    })

    test('doFilterNumber GE', () => {

        const result = filter.doFilterNumber('GE', '2', testNumberArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [ {
                items: {
                    item: 3
                }
            }, {
                items: {
                    item: 2
                }
            }]
        )

    })

    test('doFilterNumber GT', () => {

        const result = filter.doFilterNumber('GT', '2', testNumberArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [ {
                items: {
                    item: 3
                }
            }]
        )

    })

    test('doFilterDate EQ', () => {

        const result = filter.doFilterDate('EQ', '2021-01-11T00:00:00.000z', testDateArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: '2021-01-11T00:00:00.000z'
                },
            }]
        )

    })

    test('doFilterDate LT', () => {

        const result = filter.doFilterDate('LT', '2021-01-12T00:00:00.000z', testDateArray, prepSortItemOpenDate)

        expect(result).toEqual(
            [{
                items: {
                    item: '2020-03-20T00:00:00.000z'
                }
            }, {
                items: {
                    item: '2021-01-11T00:00:00.000z'
                },
            }]
        )

    })

    test('doFilterDate incorrect date', () => {

        expect.assertions(2);


        try {
            filter.doFilterDate('LT', 'asdasdasd', testDateArray, prepSortItemOpenDate)
        } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError)
            expect(error).toHaveProperty('message', 'Incorrect date provided for filtering')
        }

    })

})