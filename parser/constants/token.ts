export enum TokenType {
  /** identifier */
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  COMMENT = 'COMMENT',
  WHITE_SPACE = 'WHITE_SPACE',

  /** ( */
  OPEN_PAREN = 'OPEN_PAREN',
  /** ) */
  CLOSE_PAREN = 'CLOSE_PAREN',
  /** { */
  OPEN_BRACE = 'OPEN_BRACE',
  /** } */
  CLOSE_BRACE = 'CLOSE_BRACE',
  /** [ */
  OPEN_BRACKET = 'OPEN_BRACKET',
  /** [ */
  CLOSE_BRACKET = 'CLOSE_BRACKET',
  /** , */
  COMMA = 'COMMA',
  /** ; */
  SEMICOLON = 'SEMICOLON',

  /** + */
  ADD = 'ADD',
  /** ++ */
  INCREMENT = 'INCREMENT',
  /** - */
  SUB = 'SUB',
  /** -- */
  DECREMENT = 'DECREMENT',
  /** = */
  ASSIGNMENT = 'ASSIGNMENT',
  /** == */
  EQUALITY = 'EQUALITY',
  /** | */
  BITWISE_OR = 'BITWISE_OR',
  /** || */
  OR = 'OR',

  U8 = 'U8',
  PRINT = 'PRINT',
  SPRINT = 'SPRINT',

  EOF = 'EOF',
}

export enum Keyword {
  'u8' = TokenType.U8,
  'print' = TokenType.PRINT,
  'sprint' = TokenType.SPRINT,
}

export const KEYWORDS = Object.keys(Keyword)

export enum SingleCharToken {
  '(' = TokenType.OPEN_PAREN,
  ')' = TokenType.CLOSE_PAREN,
  '[' = TokenType.OPEN_BRACKET,
  ']' = TokenType.CLOSE_BRACKET,
  '{' = TokenType.OPEN_BRACE,
  '}' = TokenType.CLOSE_BRACE,
  ',' = TokenType.COMMA,
  ';' = TokenType.SEMICOLON,
}

export const SINGLE_CHAR_TOKEN_CHARS = Object.keys(SingleCharToken)

export enum OperatorToken  {
  '=' = TokenType.ASSIGNMENT,
  '|' = TokenType.BITWISE_OR,
  '+' = TokenType.ADD,
  '-' = TokenType.SUB,
}

export const OPERATOR_TOKEN_CHARS = Object.keys(OperatorToken)

export enum UpdateOperatorToken  {
  '++' = TokenType.INCREMENT,
  '--' = TokenType.DECREMENT,
}
