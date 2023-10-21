export const integers = [1000, 500, 100, 50, 10, 5, 1]
const literals = 'mdclxvi'

export const arabicToRomanMap = new Map(integers.map((int, index) => [int, literals[index]]))
export const romanToArabicMap = new Map(integers.map((int, index) => [literals[index], int]))

Number.prototype.toRoman = function () {
    return toRoman(this.valueOf())
}

String.prototype.toArabic = function () {
    return toArabic(this.valueOf())
}

declare global {
    interface Number {
        toRoman(): string
    }

    interface String {
        toArabic(): number
    }
}

export function isValidRoman(candidate: string): boolean {
    return /^(m{0,4})(d?c{0,3}|c[dm])(l?x{0,3}|x[lc])(v?i{0,3}|i[vx])$/gi.test(candidate)
}

export const processRomanDigit = (digit: string, position: number) => {
    if (position === 4) return 'm'.repeat(digit.toArabic())

    return digit
        .split('')
        .map(char => romanToArabicMap.get(char)!)
        .map(digitNumber => arabicToRomanMap.get(digitNumber * 10 ** (position - 1))!)
        .join('')
}

export const processArabicDigit = (digit: number) => {
    if (digit === 0) return ''
    if (arabicToRomanMap.has(digit)) return arabicToRomanMap.get(digit)!

    const foundLessByOne = integers.find(integer => integer - digit === 1)
    if (foundLessByOne !== undefined) return `i${arabicToRomanMap.get(foundLessByOne)}`

    return integers.reduce((accumulator, integer) => {
        while (digit >= integer) {
            accumulator += arabicToRomanMap.get(integer)
            digit -= integer
        }

        return accumulator
    }, '')
}

export function toArabic(value: string): number {
    value = value.toLowerCase()

    if (value === '') throw new Error('Expect not to be empty string')
    if (!isValidRoman(value)) throw new Error(`Expect valid roman number, got ${value}`)

    return value
        .split('')
        .map(char => romanToArabicMap.get(char)!)
        .reduce(
            (accumulator, digit, index, digits) =>
                digits[index + 1] > digit ? accumulator - digit : accumulator + digit,
            0,
        )
}

export function toRoman(value: number): string {
    if (!Number.isInteger(value)) throw new Error(`Expected integer, got ${value}`)
    if (value < 0 || value > 5000)
        throw new Error(`Expect value between 0 and 5000 exclusive, got ${value}`)

    if (arabicToRomanMap.has(value)) return arabicToRomanMap.get(value)!

    return value
        .toString()
        .split('')
        .map(Number)
        .map(processArabicDigit)
        .map((digit, index, array) => processRomanDigit(digit, array.length - index))
        .join('')
}
