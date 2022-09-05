import U8 from './u8.ts'
import { TokenType, UpdateOperatorToken } from './constants/token.ts'

type Context = Record<string, U8 | undefined | void>

export abstract class Node {
  abstract evaluate(context: Context): any
}

export class Identifier extends Node {
  type = 'Identifier'

  name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  evaluate(context: Context) {
    if (!(this.name in context)) {
      throw new Error(`${this.name} is not defined`)
    }
    return context[this.name]
  }
}

export class NumericLiteral extends Node {
  type = 'NumericLiteral'

  value: number

  constructor(value: string | number) {
    super()
    this.value = Number(value)
  }

  evaluate(context: Context) {
    return new U8(this.value)
  }
}

/**
 * bitwise or expr
 * eg. 1 | 2 | 3
 */
export class U8BitwiseOrExpression extends Node {
  type = 'U8BitwiseOrExpression'

  left: NumericLiteral

  right?: U8BitwiseOrExpression

  list: number[]

  constructor(left: NumericLiteral, right?: U8BitwiseOrExpression) {
    super()
    this.left = left
    this.right = right
    this.list = this.getList()
  }

  private getList(): number[] {
    const right = this.right?.getList()
    if (right) {
      right.unshift(this.left.value)
      return right
    }
    return [this.left.value]
  }

  evaluate(context: Context) {}
}

export class U8Expression extends Node {
  type = 'U8Expression'

  elements: U8BitwiseOrExpression

  constructor(elements: U8BitwiseOrExpression) {
    super()
    this.elements = elements
  }

  evaluate(context: Context): U8 {
    return new U8(this.elements.list)
  }
}

export class U8MemberExpresssion extends Node {
  type = 'U8MemberExpresssion'

  object: Identifier

  property: U8BitwiseOrExpression | NumericLiteral

  propertyIndexes: number | number[]

  constructor(object: Identifier, property: U8BitwiseOrExpression | NumericLiteral) {
    super()
    this.object = object
    this.property = property
    this.propertyIndexes = this.getPropertyIndexes()
  }

  private getPropertyIndexes() {
    let indexes
    if (this.property instanceof U8BitwiseOrExpression) {
      indexes = this.property.list
    } else {
      indexes = this.property.value
    }
    return indexes
  }

  evaluate(context: Context) {
    const u8 = this.object.evaluate(context)
    if (!u8) {
      throw new Error(`Cannot read properties of undefined (reading ${this.object.name})`)
    }
    return u8.getValue(this.propertyIndexes)
  }
}

export class U8AssignmentExpression extends Node {
  type = 'U8AssignmentExpression'

  left: U8MemberExpresssion | Identifier

  right: NumericLiteral | U8Expression | U8MemberExpresssion

  constructor(left: U8MemberExpresssion | Identifier, right: NumericLiteral | U8Expression | U8MemberExpresssion) {
    super()
    this.left = left
    this.right = right
  }

  evaluate(context: Context) {
    if (this.left instanceof U8MemberExpresssion) {
      const key = this.left.object.name
      if (!(key in context)) {
        throw new TypeError(`${key} is not defined`)
      }
      const u8 = context[key]
      if (u8) {
        if (this.right instanceof U8Expression) {
          throw new TypeError(`U8MemberExpresssion can not be assigned to a U8Expression`)
        }
        const target = this.right.evaluate(context)?.value
        target && u8.setValue(this.left.propertyIndexes, Array.isArray(target) ? target[0] : target)
      } else {
        throw new TypeError(`${key} is undefined`)
      }
    } else {
      const key = this.left.name
      if (!(key in context)) {
        throw new TypeError(`${key} is not defined`)
      }
      context[key] = this.right.evaluate(context)
    }
  }
}

/**
 * u8 array init expr
 * eg. [10]
 */
export class U8InitExpression extends Node {
  type = 'U8InitExpression'

  argument: number

  constructor(argument: number) {
    super()
    this.argument = argument
  }

  evaluate(context: Context) {
    return new U8(0, this.argument)
  }
}

export class UpdateExpression extends Node {
  type = 'UpdateExpression'

  argument: Identifier

  operationType: TokenType.INCREMENT | TokenType.DECREMENT

  operator: string

  constructor(operationType: TokenType.INCREMENT | TokenType.DECREMENT, argument: Identifier) {
    super()
    this.argument = argument
    this.operationType = operationType
    // @ts-ignore
    this.operator = UpdateOperatorToken[operationType]
  }

  evaluate(context: Context) {
    const val = context[this.argument.name]
    this.operationType === TokenType.INCREMENT ? val?.increment() : val?.decrement()
    return val
  }
}

export class VariableDeclaration extends Node {
  type = 'VariableDeclaration'

  identifier: Identifier

  init?: Expression

  constructor(identifier: Identifier, init?: Expression) {
    super()
    this.identifier = identifier
    this.init = init
  }

  evaluate(context: Context) {
    const val = this.init?.evaluate(context)
    context[this.identifier.name] = val
  }
}

export class ExpressionStatement extends Node {
  type = 'ExpressionStatement'

  expression: Expression

  constructor(expression: Expression) {
    super()
    this.expression = expression
  }

  evaluate(context: Context) {
    return this.expression.evaluate(context)
  }
}

export class PrintStatement extends Node {
  type = 'PrintStatement'

  argument?: Expression

  constructor(argument?: Expression) {
    super()
    this.argument = argument
  }

  evaluate(context: Context) {
    if (this.argument) {
      const val = this.argument.evaluate(context)
      console.log(val?.print())
    }
  }
}

export class SprintStatement extends Node {
  type = 'SprintStatement'

  argument: U8BitwiseOrExpression

  constructor(argument: U8BitwiseOrExpression) {
    super()
    this.argument = argument
  }

  evaluate(context: Context) {
    console.log(String.fromCodePoint(...this.argument.list))
  }
}

export type Expression =
  | Identifier
  | NumericLiteral
  | U8BitwiseOrExpression
  | U8Expression
  | U8MemberExpresssion
  | U8AssignmentExpression
  | U8InitExpression
  | UpdateExpression

export type Statement =
  | VariableDeclaration
  | ExpressionStatement
  | PrintStatement
  | SprintStatement

export class Program {
  type = 'Program'

  body: Statement[]

  constructor(body: Statement[]) {
    this.body = body
  }

  evaluate(context: Context = {}) {
    this.body.forEach((item) => {
      item.evaluate(context)
    })
  }
}
