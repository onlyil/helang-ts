import { TokenType } from './constants/token.ts'
import State from './state.ts'

class Token {
  type: TokenType

  value: string

  index: number

  constructor(state: State, index: number) {
    this.type = state.type
    this.value = state.value
    this.index = index
  }
}

export default Token
