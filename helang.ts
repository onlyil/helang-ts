import * as inquirer from 'https://deno.land/x/inquirer@v0.0.4/mod.ts'
import Lexer from './parser/lexer.ts'
import Parser from './parser/parser.ts'

enum Launcher {
  SHELL = 'shell',
  GREAT = 'great',
}

const shellLauncher = async () => {
  const context = {}
  while (true) {
    let text = await inquirer.input({
      message: '> ',
    })
    if (!text) continue
    if (text === 'exit') break
    if (text[text.length - 1] !== ';') text += ';'
    try {
      const tokens = new Lexer(text).tokenize()
      const ast = new Parser(tokens).parse()
      ast.evaluate(context)
    } catch (e) {
      console.log(`Error: ${e.message}`)
    }
  }
}

const greatLauncher = async () => {
  const text = await Deno.readTextFile('./great.he')
  const tokens = new Lexer(text).tokenize()
  const ast = new Parser(tokens).parse()
  ast.evaluate()
}

const LAUNCHERS = {
  [Launcher.SHELL]: shellLauncher,
  [Launcher.GREAT]: greatLauncher,
}

const launch = () => {
  const method = Deno.args[0] as Launcher
  LAUNCHERS[method || Launcher.SHELL]?.()
}

launch()
