import * as ts from 'typescript'

export function compilerPlugin(): ts.TransformerFactory<ts.SourceFile> {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node) => {
      if (ts.isSourceFile(node) && node.languageVariant === ts.LanguageVariant.JSX) {
        const newSourceFile = ts.updateSourceFileNode(node, [
          ts.createImportDeclaration(
            undefined,
            undefined,
            ts.createImportClause(
              undefined,
              ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier('ViewComponent'))]),
            ),
            ts.createLiteral('xcx-fucker'),
          ),
          ...node.statements,
        ])
        return ts.visitEachChild(newSourceFile, visitor, context)
      }
      if (ts.isMethodDeclaration(node) && node.name.getText() === 'render') {
        return transforRenderMethod(node, context)
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return (node) => ts.visitNode(node, visitor)
  }
  return transformer

  function transforRenderMethod(renderMethod: ts.MethodDeclaration, context: ts.TransformationContext) {
    const visitor: ts.Visitor = (node) => {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'view') {
        node.openingElement = ts.updateJsxOpeningElement(
          node.openingElement,
          ts.createIdentifier('ViewComponent'),
          node.openingElement.attributes,
        )
        node.closingElement = ts.updateJsxClosingElement(node.closingElement, ts.createIdentifier('ViewComponent'))
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitEachChild(renderMethod, visitor, context)
  }
}
