type Test = string | RegExp | ((char: string) => boolean)

interface PToken<T = unknown> {
    value?: T,
    type: string,
}

interface ParserValue<T = unknown> extends PToken<T> {

}

enum ParserState {
    EXPECT_NEW_INPUT
}

type ParserResult<T = unknown> = [ParserValue, Iterable<string>]

type Parser<T = unknown, R = unknown> = (iterable: Iterable<string>, prev?: ParserValue) =>
    Generator<ParserState | PToken<T>, ParserResult<R>, Iterable<string>>


class ParserError extends Error {
    prev?: ParserValue
    constructor(message: string, prev?: ParserValue) {
        super(message);
        this.prev = prev
    }
}

function intoIter<T>(iterable: Iterable<T>): IterableIterator<T> {
   return intoIterable(iterable[Symbol.iterator]())
}

function intoIterable<T>(iter: Iterator<T>): IterableIterator<T> {
    // @ts-ignore IDK how to fix this
    if (typeof iter[Symbol.iterator] === 'function') {
        return <any>iter;
    }

    return {
        [Symbol.iterator](): IterableIterator<T> {
            return this;
        },
        next(): IteratorResult<T> {
            return iter.next();
        }
    }
}

interface TakeOptions {
    min?: number,
    max?: number,
}

function testChar(test: Test, char: string, prev?: ParserValue): boolean {
    switch (typeof test) {
        case 'string':
            if (test !== char) {
                throw new ParserError('Invalid string', prev)
            }

            break

        case 'function':
            if (test(char)) {
                throw new ParserError('Invalid string', prev)
            }

            break

        default:
            if (!test.test(char)) {
                throw new ParserError('Invalid string', prev)
            }
    }

    return true
}

function take(test: Test, {min = 1, max = Infinity}: TakeOptions = {}): Parser<string, string> {
    return function* (source: Iterable<string>, prev) {
        let sourceIter = intoIter(source)
        let value = ''
        let count = 0

        while (true) {
            let chunk = sourceIter.next()
            let char = chunk.value

            if (chunk.done) {
                source = yield ParserState.EXPECT_NEW_INPUT
                sourceIter = intoIter(source)
                chunk = sourceIter.next()
                char = chunk.value
            }

            testChar(test, char, prev)

            value += char
        }

        const token: PToken<string> = {
            type: 'TAG',
            value
        }

        return [token, sourceIter]
    }
}

function tag(pattern: Iterable<Test>): Parser<string, string> {
    return function* (source: Iterable<string>, prev) {
        let sourceIter = intoIter(source)
        let value = ''

        for (const test of pattern) {
            let chunk = sourceIter.next()
            let char = chunk.value

            if (chunk.done) {
                source = yield ParserState.EXPECT_NEW_INPUT
                sourceIter = intoIter(source)
                chunk = sourceIter.next()
                char = chunk.value
            }

            testChar(test, char, prev)

            value += char
        }

        const token: PToken<string> = {
            type: 'TAG',
            value
        }

        return [token, sourceIter]
    }
}

const div = tag('<div>')

const d = div('<di')

d.next()

console.log(d.next('v>'))
