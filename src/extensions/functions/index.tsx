import {Parser} from 'expr-eval'
import functionConfig from '../../config/custom-function'

export interface CustomFunction {
    id: string
    apply: (...args: any) => any
    display: (...args: any) => string
}

export interface CustomFunctionContext {
    expression: string
}

const parser = new Parser()
const functions: CustomFunction[] = functionConfig.functions
for (const func of functions) {
    parser.functions[func.id] = func.apply
    parser.functions[`${func.id}Display`] = func.display
}

export const evaluate = (context: CustomFunctionContext): any =>
    parser.evaluate(context.expression)
