import type * as vscode from 'vscode'

import { LinkProvider } from '~/providers/linkProvider'

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated!')
  LinkProvider.register(context)
}

export function deactivate() {}
