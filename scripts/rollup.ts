import fs from 'node:fs/promises'
import path from 'node:path'

import alias, { type Alias, type ResolverFunction } from '@rollup/plugin-alias'

import { rootDir } from './utils'

function resolveExtensions(extensions: string[]): ResolverFunction {
  return async function (source) {
    try {
      const { isDirectory } = await fs.stat(source)

      if (isDirectory()) {
        source = path.join(source, 'index')
      }
    } catch {}

    for (const extension of extensions) {
      try {
        const moduleInfo = await this.load({ id: source + extension })
        return moduleInfo.id
      } catch {}
    }

    return null
  }
}

export type AliasWithoutResolver = Omit<Alias, 'customResolver'>

export const tsPathAlias: AliasWithoutResolver = {
  find: /^~\/(.+)/,
  replacement: path.resolve(rootDir, 'src/$1')
}

export const tsPathAliasPlugin = alias({
  customResolver: resolveExtensions(['.ts']),
  entries: [tsPathAlias]
})
