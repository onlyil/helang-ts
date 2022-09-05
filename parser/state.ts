import { TokenType } from './constants/token.ts'

class State {
  type: TokenType = TokenType.EOF

  value: string = ''

  /**
   * current position
   * tracking our position in the code like a cursor
   */
  pos: number = 0

  start: number = 0

  end: number = 0
}

export default State
