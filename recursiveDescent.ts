//алфавит
//слова (строки)
//грамматика


// 1 + 5 * 9 / (1 - 2)

// program = $expr0 | _

// expr0 = $expr1 | $expr1 + $expr0 | $expr1 - $expr0

// expr1 = $expr2 | $expr2 / $expr1 | $expr2 * $expr1

// expr2 = $num | ($expr0)

// num = -$\d+

interface Token {
    type: string
    value?: string | Token[]
}

console.dir(parse('(1+2)*3'), {depth: null})

function parse(str: string) {
    const tokens: Token[] = []

    program(str, tokens)

    return tokens
}

function program(str: string, tokens: Token[]): string {
    if (str === '') {
        return ''
    }

    return expr0(str, tokens)
}

function expr0(str: string, tokens: Token[]): string {
    const subTokens: Token[] = [], newStr = expr1(str, subTokens), laSymbol = newStr[0]

    if (laSymbol === '+' || laSymbol === '-') {
        const res = expr0(newStr.slice(1), subTokens)

        tokens.push({
            type: laSymbol,
            value: subTokens
        })

        return res
    }

    tokens.push(...subTokens)

    return newStr
}

function expr1(str: string, tokens: Token[]): string {
    const subTokens: Token[] = [], newStr = expr2(str, subTokens), laSymbol = newStr[0]

    if (laSymbol === '/' || laSymbol === '*') {
        const res = expr1(newStr.slice(1), subTokens)

        tokens.push({
            type: laSymbol,
            value: subTokens
        })

        return res
    }

    tokens.push(...subTokens)

    return newStr
}

function expr2(str: string, tokens: Token[]): string {
    if (str[0] === '(') {
        const subTokens: Token[] = []
        let newStr = expr0(str.slice(1), subTokens)

        if (newStr[0] !== ')') {
            throw new SyntaxError('Invalid string')
        }

        tokens.push({
            type: "GROUP",
            value: subTokens
        })
        return newStr.slice(1)
    }

    return num(str, tokens)
}

function num(str: string, tokens: Token[]): string {
    const literal = /^-?\d+/.exec(str)

    if (literal === null) {
        throw new SyntaxError('Invalid string')
    }

    const token: Token = {
        type: "NUM",
        value: literal[0]
    }

    tokens.push(token)

    return str.slice(token.value?.length)
}
