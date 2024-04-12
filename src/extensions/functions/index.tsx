import {Parser} from 'js-expression'
import functionConfig from '../../config/customFunction'

export interface CustomFunction {
    id: string
    category: string
    exec: (...args: any[]) => any
    description?: string
}

type CustomFunctionInfo = Omit<CustomFunction, 'exec'>

export interface CustomFunctionContext {
    expression: string
    values?: {[key: string]: any}
}

const parser = new Parser()
const functions: CustomFunction[] = functionConfig.functions
for (const func of functions) {
  parser.addFunction(func.id, func.exec)
}

export const getParser = () => parser

export function evaluate(context: CustomFunctionContext): any {
  const expr = parser.parse(context.expression)
  return expr.evaluate(context.values)
}

export const getInfo = (): CustomFunctionInfo[] =>
  functions.map(f => ({
    id: f.id,
    category: f.category,
    description: f.description
  }))
