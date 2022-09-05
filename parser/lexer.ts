import State from './state.ts'
import Token from './token.ts'
import { KEYWORDS, OperatorToken, TokenType, SingleCharToken, SINGLE_CHAR_TOKEN_CHARS, Keyword } from './constants/token.ts'

class Lexer {
  /** input string */
  private input: string

  private state: State

  private tokens: Token[] = []

  private index = 0

  constructor(input: string) {
    this.input = input
    this.state = new State()
  }

  private get current() {
    return this.input[this.state.pos]
  }

  private get next() {
    return this.input[this.state.pos + 1]
  }

  /** lexer entry */
  tokenize() {
    while (this.state.pos < this.input.length) {
      this.nextToken()
    }
    return this.tokens
  }

  private nextToken() {
    this.skipSpace()
    this.state.start = this.state.pos
    if (this.state.pos >= this.input.length) {
      this.finishToken(TokenType.EOF, 'EOF')
      return
    }

    this.getTokenFromChar()
  }

  private skipSpace() {
    // linefeed can not match with /\n/
    while (/\s/.test(this.current) || this.current === '\n') {
      this.state.pos += 1
    }
  }

  private finishToken(type: TokenType, value: any = null) {
    this.state.end = this.state.pos
    this.state.type = type
    this.state.value = value
    this.tokens.push(new Token(this.state, this.index++))
  }

  private getTokenFromChar() {
    const char = this.current

    // read comment
    if (char === '/') {
      this.state.type = TokenType.COMMENT
      this.readComment()
      return
    }

    // read identifier
    if (/[a-zA-Z_$]/.test(char)) {
      this.state.type = TokenType.IDENTIFIER
      this.readIdentifier()
      return
    }

    // read assignment or equality
    // @ts-ignore
    if (char === OperatorToken[TokenType.ASSIGNMENT]) {
      this.state.type = TokenType.ASSIGNMENT
      this.readAssignmentOrEquality()
      return
    }

    // read or
    // @ts-ignore
    if (char === OperatorToken[TokenType.BITWISE_OR]) {
      this.state.type = TokenType.BITWISE_OR
      this.readOr()
      return
    }

    // read number
    if (/\d/.test(char)) {
      this.state.type = TokenType.NUMBER
      this.readNumber()
      return
    }

    if (['+', '-'].includes(char)) {
      if (this.next === this.current) {
        this.finishToken(this.current === '+' ? TokenType.INCREMENT : TokenType.DECREMENT)
        this.state.pos += 1
        return
      }
    }

    // read single char
    if (SINGLE_CHAR_TOKEN_CHARS.includes(char)) {
      this.readSingleChar()
      return
    }

    this.state.pos += 1
  }

  private readComment() {
    this.state.value = ''
    while(this.current !== '\n') {
      if (this.state.value === '/' && this.current !== '/') {
        throw new Error('bad grammer of comment')
      }

      this.state.value += this.current
      this.state.pos += 1
    }
    this.finishToken(TokenType.COMMENT, this.state.value)
  }

  private readIdentifier() {
    this.state.value = ''
    while (/[a-zA-Z0-9_$]/.test(this.current)) {
      this.state.value += this.current
      this.state.pos += 1
    }
    const id = this.state.value;
    const isKeyword = KEYWORDS.includes(id)
    // @ts-ignore
    this.finishToken(isKeyword ? Keyword[id] : TokenType.IDENTIFIER, id)
  }

  private readAssignmentOrEquality() {
    this.state.value = ''
    while (this.current === '=') {
      this.state.value += this.current
      this.state.pos += 1
    }
    this.finishToken(this.state.value === '=' ? TokenType.ASSIGNMENT : TokenType.EQUALITY, this.state.value)
  }

  private readOr() {
    this.state.value = ''
    while (this.current === '|') {
      this.state.value += this.current
      this.state.pos += 1
    }
    this.finishToken(this.state.value === '|' ? TokenType.BITWISE_OR : TokenType.OR, this.state.value)
  }

  private readNumber() {
    this.state.value = ''
    // only support integer now
    while (/\d/.test(this.current)) {
      this.state.value += this.current
      this.state.pos += 1
    }
    this.finishToken(TokenType.NUMBER, this.state.value)
  }

  private readSingleChar() {
    const char = this.current
    // @ts-ignore
    this.finishToken(SingleCharToken[char], char)
    this.state.pos += 1
  }
}

export default Lexer
