const operators = /[*+]/
const priorityTable = {
    '+': 0,
    '*': 1
}

type operatorChar = keyof typeof priorityTable

function parseExpression(str: string) {
    if (/[^\d+*]/.test(str)) {
        return NaN
    }

    if (/(^|\D)[*+]($|\D)/.test(str)) {
        return NaN
    }

    const
        queue = [],
        stack = []

    for (const char of str) {
        if (operators.test(char)) {
            if (stack.length === 0) {
                stack.push(char)
            } else {
                let head = stack[stack.length - 1] as operatorChar

                while (priorityTable[head] > priorityTable[char as operatorChar]) {
                    queue.push(stack.pop())

                    head = stack[stack.length - 1] as operatorChar
                }

                stack.push(char)
            }
        } else {
            queue.push(parseInt(char))
        }
    }

    while (stack.length) queue.push(stack.pop())

    const expressionStack: number[] = []

    while (queue.length) {
        const value = queue.shift()

        if (typeof value === 'number') {
            expressionStack.push(value)
        } else {
            switch (value) {
                case '+': {
                    expressionStack.push(expressionStack.pop()! + expressionStack.pop()!)
                    break
                }

                case '*': {
                    expressionStack.push(expressionStack.pop()! * expressionStack.pop()!)
                    break
                }
            }
        }
    }

    return expressionStack[0]
}

console.log(parseExpression('1+2*4+3*2'))