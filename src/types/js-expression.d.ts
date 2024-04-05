declare module 'js-expression' {
    export class Expression {
      simplify: (values?: {[key: string]: any}) => Expression
      evaluate: (values?: {[key: string]: any}) => any
      substitute: (variable: string, expr: string | Expression) => Expression
      variables: (includeFunctions?: boolean) => any[]
      toEvalFunction: () => (values?: {[key: string]: any}) => any
      toJSFunction: (params: string[], values?: {[key: string]: any}) => (...args: any[]) => any
    }

    export class Parser {
      overload: (key: string, clazz: Object, func: (...args: any[]) => any) => void
      parse: (expr: string) => Expression
      evaluate: (values?: {[key: string]: any}) => any
      addOperator: (name: string, priority: number, func: (...args: any[]) => any) => void
      addFunction: (name: string, func: (...args: any[]) => any, canSimplify?: boolean) => void
    }
}