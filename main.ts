import Lexer from './parser/lexer.ts'
import Parser from './parser/parser.ts'

console.log('Hello Deno')

const text = await Deno.readTextFile('./tests/demo.txt')

const tokens = new Lexer(text).tokenize()

console.log(tokens)

const ast = new Parser(tokens).parse()

// console.log(ast);

console.log('=======');

ast.evaluate()
