import Token from './token.ts'
import State from './state.ts'
import { TokenType } from './constants/token.ts'
import * as AST from './ast.ts'

class Parser {
  /** input tokens */
  tokens: Token[]

  private pos = 0

  constructor(input: Token[]) {
    this.tokens = input
  }

  private get current() {
    return this.tokens[this.pos]
  }

  private get next() {
    return this.tokens[this.pos + 1]
  }

  private goNext() {
    this.pos += 1
  }

  private finishNode<T extends AST.Node>(node: T): T {
    this.goNext()
    return node;
  }

  parse(): AST.Program {
    const body: AST.Statement[] = []
    while(this.pos < this.tokens.length) {
      const statement = this.parseStatement()
      statement && body.push(statement)
    }
    return new AST.Program(body)
  }

  private parseStatement(): AST.Statement | undefined {
    const token = this.current
    const startType = token.type

    if (startType === TokenType.U8) {
      return this.parseVariableDeclaration()
    }

    if (startType === TokenType.IDENTIFIER) {
      return this.parseExpressionStatement()
    }

    if (startType === TokenType.PRINT) {
      return this.parsePrintStatement()
    }

    if (startType === TokenType.SPRINT) {
      return this.parseSprintStatement()
    }

    if (startType === TokenType.COMMENT) {
      this.goNext()
      return
    }

    if (startType === TokenType.EOF) {
      this.goNext()
      return
    }

    this.raise(`can not recognize token ${token.type} at pos ${this.pos}`)
  }

  /**
   * G: E -> U8 IDENTIFIER = expr ;
   *    E -> U8 IDENTIFIER ;
   * @returns VariableDeclaration ast node
   */
  private parseVariableDeclaration(): AST.VariableDeclaration {
    this.expect(TokenType.U8)
    const id = this.expect(TokenType.IDENTIFIER)
    // only declaration
    if (this.current.type === TokenType.SEMICOLON) {
      return this.finishNode(new AST.VariableDeclaration(new AST.Identifier(id.value!)))
    }

    this.expect(TokenType.ASSIGNMENT)
    // parse expr
    const expr = this.parseExpresssion()
    this.expect(TokenType.SEMICOLON)

    let init = expr
    // this scene, U8BitwiseOrExpression -> U8Expression
    if (expr instanceof AST.U8BitwiseOrExpression) {
      init = new AST.U8Expression(expr)
    }
    return new AST.VariableDeclaration(new AST.Identifier(id.value!), init)
  }

  private parseExpressionStatement(): AST.ExpressionStatement | undefined {
    const expr = this.parseExpresssion()
    this.expect(TokenType.SEMICOLON)
    if (expr) {
      return new AST.ExpressionStatement(expr)
    }
  }

  private parseExpresssion(): AST.Expression | undefined {
    const pos = this.pos
    const currentType = this.current.type

    if (currentType === TokenType.NUMBER) {
      return this.parseNumberLookahead()
    }

    if (currentType === TokenType.IDENTIFIER) {
      return this.parseIdentifierLookahead()
    }

    if (currentType === TokenType.OPEN_BRACKET) {
      return this.parseU8InitExpression()
    }

    this.raise(`can not parse Expression at pos ${pos}`)
  }

  private parseNumberLookahead() {
    // if next get a BITEWISE_OR "|", go parse parseU8BitwiseOrExpression
    if (this.next.type === TokenType.BITWISE_OR) {
      return this.parseU8BitwiseOrExpression()
    }
    return this.finishNode(new AST.NumericLiteral(this.current.value))
  }

  private parseIdentifierLookahead() {
    const pos = this.pos
    const nextType = this.next.type
    // if next get a OPEN_BRACKET "[", go parseU8MemberExpression
    // after get U8MemberExpression, if next is "=", back and go parseU8AssignmentExpression
    if (nextType === TokenType.OPEN_BRACKET) {
      const expr =  this.parseU8MemberExpression()
      if (this.current.type === TokenType.ASSIGNMENT) {
        this.pos = pos
        return this.parseU8AssignmentExpression()
      }
      return expr
    }

    // if next get a "=", go parseU8AssignmentExpression
    if (nextType === TokenType.ASSIGNMENT) {
      return this.parseU8AssignmentExpression()
    }

    if (nextType === TokenType.INCREMENT) {
      return this.parseUpdateExpression()
    }

    return this.finishNode(new AST.Identifier(this.current.value))
  }

  /**
   * G: E -> NUMBER | E
   *    E -> NUMBER
   */
  private parseU8BitwiseOrExpression(): AST.U8BitwiseOrExpression {
    const numberToken = this.expect(TokenType.NUMBER)
    const left = new AST.NumericLiteral(numberToken.value)
    try {
      this.expect(TokenType.BITWISE_OR)
    } catch (e) {
      return new AST.U8BitwiseOrExpression(left)
    }
    return new AST.U8BitwiseOrExpression(left, this.parseU8BitwiseOrExpression())
  }

  /**
   * G: E -> IDENTIFIER [ U8BitwiseOrExpression ]
   */
  private parseU8MemberExpression(): AST.U8MemberExpresssion {
    const id = this.expect(TokenType.IDENTIFIER)
    this.expect(TokenType.OPEN_BRACKET)
    const node = this.parseNumberLookahead()
    this.expect(TokenType.CLOSE_BRACKET)
    return new AST.U8MemberExpresssion(new AST.Identifier(id.value), node)
  }

  /**
   * G: E -> IDENTIFIER [ NUMBER ] = NUMBER
   *    E -> IDENTIFIER = NUMBER
   */
  private parseU8AssignmentExpression(): AST.U8AssignmentExpression {
    const pos = this.pos
    const id = this.expect(TokenType.IDENTIFIER)
    let expr: AST.Identifier | AST.U8MemberExpresssion = new AST.Identifier(id.value)
    if (this.current.type === TokenType.OPEN_BRACKET) {
      this.pos = pos
      expr =  this.parseU8MemberExpression()
    }
    this.expect(TokenType.ASSIGNMENT)

    const node = this.current.type === TokenType.IDENTIFIER
      ? this.parseIdentifierLookahead()
      : this.parseNumberLookahead()

    let right = node as (AST.NumericLiteral | AST.U8Expression | AST.U8MemberExpresssion)
    if (node instanceof AST.U8BitwiseOrExpression) {
      right = new AST.U8Expression(node)
    }
    return new AST.U8AssignmentExpression(expr, right)
  }

  /**
   * G: E -> [ NUMBER ]
   */
  private parseU8InitExpression(): AST.U8InitExpression {
    this.expect(TokenType.OPEN_BRACKET)
    const number = this.expect(TokenType.NUMBER)
    this.expect(TokenType.CLOSE_BRACKET)
    return new AST.U8InitExpression(Number(number.value))
  }

  /**
   * G: E -> IDENTIFIER++
   */
  private parseUpdateExpression() {
    const id = this.expect(TokenType.IDENTIFIER)
    const operator = this.expect([TokenType.INCREMENT, TokenType.DECREMENT])
    return new AST.UpdateExpression(
      operator.type as (TokenType.INCREMENT | TokenType.DECREMENT),
      new AST.Identifier(id.value)
    )
  }

  /**
   * G: E -> PRINT expr
   */
  private parsePrintStatement(): AST.PrintStatement {
    this.expect(TokenType.PRINT)
    const argument = this.parseExpresssion()
    this.expect(TokenType.SEMICOLON)
    return new AST.PrintStatement(argument)
  }

  /**
   * G: E -> SPRINT U8BitwiseOrExpression
   */
   private parseSprintStatement(): AST.SprintStatement {
    this.expect(TokenType.SPRINT)
    const argument = this.parseU8BitwiseOrExpression()
    this.expect(TokenType.SEMICOLON)
    return new AST.SprintStatement(argument)
  }

  private expect(typeOrTypes: TokenType | TokenType[]): Token {
    if (this.pos >= this.tokens.length) {
      this.raise('No more tokens')
    }

    const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]
    const token = this.current
    if (!types.includes(token.type)) {
      this.raise(`Expect ${types.toString()} at pos ${this.pos}, got ${token.type}`)
    }

    this.goNext()
    return token
  }

  private raise(message: string) {
    throw new Error(message);
  }
}

export default Parser
