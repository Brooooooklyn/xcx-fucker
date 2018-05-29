import * as fs from 'fs'
import { resolve } from 'path'
import * as ts from 'typescript'
import { compilerPlugin } from '../src/compiler-plugin-xcx'

const printer = ts.createPrinter()

const sourceCode = fs.readFileSync(resolve(process.cwd(), 'src', 'index.tsx'), 'utf-8')

const source = ts.createSourceFile('fixture.tsx', sourceCode, ts.ScriptTarget.ES2016, true)

const result = ts.transform(source, [compilerPlugin()])

const transformedSourceFile = result.transformed[0]

const resultCode = printer.printFile(transformedSourceFile)

// tslint:disable-next-line:no-console
console.log(resultCode)
