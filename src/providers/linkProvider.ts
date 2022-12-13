import * as vscode from 'vscode'

export class LinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const result: vscode.DocumentLink[] = []

    const activePath = vscode.workspace.getWorkspaceFolder(document.uri)!.uri
      .path
    const regex = createRegexForPath(activePath)

    for (let i = 0; i < document.lineCount; ++i) {
      const lineText = document.lineAt(i).text

      let execResult: RegExpExecArray | null

      while ((execResult = regex.exec(lineText))) {
        const linkRange = new vscode.Range(
          i,
          execResult.index,
          i,
          execResult.index + execResult[0].length
        )

        const components: {
          scheme: string
          authority?: string | undefined
          path?: string | undefined
          query?: string | undefined
          fragment?: string | undefined
        } = {
          scheme: 'file'
        }

        if (execResult[3]) {
          components.path = execResult[3]
        } else {
          components.path = execResult[1]
          components.fragment = execResult[2].replace(':', ',')
        }

        const linkTarget = vscode.Uri.from(components)

        const link = new vscode.DocumentLink(linkRange, linkTarget)

        result.push(link)
      }
    }

    return result
  }

  static register(context: vscode.ExtensionContext) {
    const disposable = vscode.languages.registerDocumentLinkProvider(
      {
        language: 'example-language',
        scheme: 'file'
      },
      new LinkProvider()
    )

    context.subscriptions.push(disposable)
  }
}

function createRegexForPath(activePath: string) {
  return new RegExp(
    `(?:(${activePath}\\S+?):(\\d+(?::\\d+)?))|(${activePath}\\S+)`,
    'g'
  )
}
