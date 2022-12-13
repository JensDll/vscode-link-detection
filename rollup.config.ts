import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import type { ExternalOption, InputPluginOption, RollupOptions } from 'rollup'
import esbuild, { minify } from 'rollup-plugin-esbuild'

import { tsPathAliasPlugin } from './scripts/rollup'
import { rootDir } from './scripts/utils'

const IS_PRODUCTION = process.env.BUILD === 'production'

const plugin = {
  esbuild: esbuild({
    target: 'ES2019'
  }),
  minify: minify({
    target: 'ES2019'
  }),
  nodeResolve: nodeResolve({
    rootDir,
    resolveOnly: [/^@internal\//]
  }),
  replace: {
    esm: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: "(process.env.NODE_ENV !== 'production')"
    }),
    dev: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: true,
      'process.env.NODE_ENV': null
    }),
    prod: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: false,
      'process.env.NODE_ENV': "'production'"
    })
  }
} as const

const baseExternals: ExternalOption = ['vscode']

const configs: RollupOptionsWithPlugins[] = [
  {
    input: 'src/extension.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      interop: 'esModule',
      sourcemap: !IS_PRODUCTION,
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      plugins: [IS_PRODUCTION && plugin.minify]
    },
    plugins: [plugin.replace.dev, plugin.nodeResolve, plugin.esbuild]
  }
]

configs.forEach(config => {
  config.plugins.unshift(tsPathAliasPlugin)

  if (config.external) {
    if (!Array.isArray(config.external)) {
      throw new Error('External option must be an array')
    }
    config.external.push(...baseExternals)
  } else {
    config.external = baseExternals
  }
})

export default configs

interface RollupOptionsWithPlugins extends RollupOptions {
  plugins: InputPluginOption[]
}
