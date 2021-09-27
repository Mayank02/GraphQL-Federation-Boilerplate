// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function uuid(a: any = '', b: any = ''): string {
    for (
        b = a = '';
        a++ < 36;
        b +=
            ~a % 5 | ((a * 3) & 4)
                ? (a ^ 15
                      ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4))
                      : 4
                  ).toString(16)
                : '-'
    );
    return b
}
const upChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function rndUpChr(): string {
    const i = rndNum(26)
    return upChars[i]
}
const lowChars = 'abcdefghijklmnopqrstuvwxyz'
function rndLowChr(): string {
    const i = rndNum(26)
    return lowChars[i]
}
const digits = '0123456789'
function rndDigit(): string {
    const i = rndNum(10)
    return digits[i]
}
function rndDigits(maxLen = 10, minLen = 1): string {
    return [...Array(minLen + rndNum(maxLen - minLen))]
        .map(() => rndDigit())
        .join('')
}
export function rndStr(maxLen = 10, minLen = 1): string {
    return [...Array(minLen + rndNum(maxLen - minLen))]
        .map(() => {
            const r = rndNum(99)
            if (r < 33) return rndUpChr()
            if (r < 66) return rndLowChr()
            return rndDigit()
        })
        .join('')
}
export function rndNum(limit = 123456789, min = 0): number {
    return min + Math.round(Math.random() * limit)
}
export function rndMoney(): string {
    return `${rndDigits(4, 1)}.${rndDigits(2, 2)}`
}
export function rndEl<T>(a: Array<T>): T {
    const i = rndNum(a.length)
    return a[i]
}
export function rndDate(
    from: Date = new Date('1/1/1950'),
    to: Date = new Date('1/1/2020'),
): Date {
    const tFrom = from.getTime()
    const tTo = to.getTime()
    return new Date(tFrom + Math.random() * (tTo - tFrom))
}
export function rndDob(): Date {
    return rndDate(new Date('1/1/1950'), new Date('1/1/2002'))
}

const firstNames = [
    'Aaliyah',
    'Aaron',
    'Abagail',
    'Abbey',
    'Abbie',
    'Abbigail',
    'Abby',
    'Abdiel',
    'Abdul',
    'Abdullah',
    'Abe',
    'Abel',
    'Abelardo',
    'Abigail',
    'Abigale',
    'Abigayle',
    'Abner',
    'Abraham',
]
const lastNames = [
    'Abbott',
    'Abernathy',
    'Abshire',
    'Adams',
    'Altenwerth',
    'Anderson',
    'Ankunding',
    'Armstrong',
    'Auer',
    'Aufderhar',
    'Bahringer',
    'Bailey',
    'Balistreri',
    'Barrows',
    'Bartell',
    'Bartoletti',
]
const nameSuffixes = [
    'Jr.',
    'Sr.',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'MD',
    'DDS',
    'PhD',
    'DVM',
]
const allNames = [...firstNames, ...lastNames]
const streetNames = [
    'Alley',
    'Avenue',
    'Branch',
    'Bridge',
    'Brook',
    'Brooks',
    'Burg',
    'Burgs',
    'Bypass',
    'Camp',
    'Canyon',
    'Cape',
    'Causeway',
    'Center',
    'Centers',
    'Circle',
    'Circles',
    'Cliff',
]
const citySuffixes = [
    'town',
    'ton',
    'land',
    'ville',
    'berg',
    'burgh',
    'borough',
    'bury',
    'view',
    'port',
    'mouth',
    'stad',
    'furt',
    'chester',
    'mouth',
    'fort',
    'haven',
    'side',
    'shire',
]
const counties = [
    'Avon',
    'Bedfordshire',
    'Berkshire',
    'Borders',
    'Buckinghamshire',
    'Cambridgeshire',
]

export const bool = (): boolean => rndEl<boolean>([true, false])
export const gender = (): string => rndEl<string>(['Male', 'Female'])
export const username = (): string =>
    rndEl<string>(allNames).toLowerCase() + rndNum(98, 1)
export const firstName = (): string => rndEl<string>(firstNames)
export const lastName = (): string => rndEl<string>(lastNames)
export const fullName = (): string =>
    `${rndEl<string>(firstNames)} ${rndEl<string>(lastNames)}`
export const nameSuffix = (): string => rndEl<string>(nameSuffixes)
export const houseNumber = (): number => rndNum(9876, 12)
export const street = (): string => rndEl<string>(streetNames)
export const postcode = (): string =>
    `${rndUpChr() + rndUpChr() + rndNum(98, 1)} ${rndNum(
        9,
        1,
    )}${rndUpChr()}${rndUpChr()}`
export const town = (): string =>
    rndEl<string>(allNames) + rndEl<string>(citySuffixes)
export const city = (): string =>
    rndEl<string>(allNames) + rndEl<string>(citySuffixes)
export const county = (): string => rndEl<string>(counties)
export const country = (): string => 'United Kingdom'
export const date = (from: Date, to: Date): Date => rndDate(from, to)
export const dob = (): Date => rndDob()

const LoremIpsumWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'curabitur',
    'vel',
    'hendrerit',
    'libero',
    'eleifend',
    'blandit',
    'nunc',
    'ornare',
    'odio',
    'ut',
    'orci',
    'gravida',
    'imperdiet',
    'nullam',
    'purus',
    'lacinia',
    'a',
    'pretium',
    'quis',
    'congue',
    'praesent',
    'sagittis',
    'laoreet',
    'auctor',
    'mauris',
    'non',
    'velit',
    'eros',
    'dictum',
    'proin',
    'accumsan',
    'sapien',
    'nec',
    'massa',
    'volutpat',
    'venenatis',
    'sed',
    'eu',
    'molestie',
    'lacus',
    'quisque',
    'porttitor',
    'ligula',
    'dui',
    'mollis',
    'tempus',
    'at',
    'magna',
    'vestibulum',
    'turpis',
    'ac',
    'diam',
    'tincidunt',
    'id',
    'condimentum',
    'enim',
    'sodales',
    'in',
    'hac',
    'habitasse',
    'platea',
    'dictumst',
    'aenean',
    'neque',
    'fusce',
    'augue',
    'leo',
    'eget',
    'semper',
    'mattis',
    'tortor',
    'scelerisque',
    'nulla',
    'interdum',
    'tellus',
    'malesuada',
    'rhoncus',
    'porta',
    'sem',
    'aliquet',
    'et',
    'nam',
    'suspendisse',
    'potenti',
    'vivamus',
    'luctus',
    'fringilla',
    'erat',
    'donec',
    'justo',
    'vehicula',
    'ultricies',
    'varius',
    'ante',
    'primis',
    'faucibus',
    'ultrices',
    'posuere',
    'cubilia',
    'curae',
    'etiam',
    'cursus',
    'aliquam',
    'quam',
    'dapibus',
    'nisl',
    'feugiat',
    'egestas',
    'class',
    'aptent',
    'taciti',
    'sociosqu',
    'ad',
    'litora',
    'torquent',
    'per',
    'conubia',
    'nostra',
    'inceptos',
    'himenaeos',
    'phasellus',
    'nibh',
    'pulvinar',
    'vitae',
    'urna',
    'iaculis',
    'lobortis',
    'nisi',
    'viverra',
    'arcu',
    'morbi',
    'pellentesque',
    'metus',
    'commodo',
    'ut',
    'facilisis',
    'felis',
    'tristique',
    'ullamcorper',
    'placerat',
    'aenean',
    'convallis',
    'sollicitudin',
    'integer',
    'rutrum',
    'duis',
    'est',
    'etiam',
    'bibendum',
    'donec',
    'pharetra',
    'vulputate',
    'maecenas',
    'mi',
    'fermentum',
    'consequat',
    'suscipit',
    'aliquam',
    'habitant',
    'senectus',
    'netus',
    'fames',
    'quisque',
    'euismod',
    'curabitur',
    'lectus',
    'elementum',
    'tempor',
    'risus',
    'cras',
]

export const loremIpsum = (maxWordCount = 5, minWordCount = 1): string =>
    [...Array(rndNum(maxWordCount, minWordCount))]
        .map(() => rndEl(LoremIpsumWords))
        .join(' ')
