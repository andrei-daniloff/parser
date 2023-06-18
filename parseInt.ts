const parseTable: Record<string, number> = {}

for (let i = 0; i < 10; i++) {
    parseTable[i] = i
}

function parseInt(str: string) {
    if (/[^\d-]/.test(str)) return NaN

    const chars = str.split('').reverse()

    const isNegative = chars.at(-1) === '-'

    isNegative && chars.pop()

    let num = 0

    for (let i = 0; i < chars.length; i++) {
        num += parseTable[chars[i]] * (10 ** i)
    }

    if (isNegative) num *= -1

    return num
}

console.log(parseInt('-1020'))