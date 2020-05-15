import { TransformOptions } from '@babel/core'

import { OnBuildPlugin } from '../../framework/lifecycle/onBuild'

export class OnBuild extends OnBuildPlugin {
  public getConfig = (previous: TransformOptions): TransformOptions => ({
    ...previous,
    rootMode: 'root',
    minified: false,
    retainLines: true,
    shouldPrintComment: () => true,
    babelrc: false,
    envName: 'NODE_ENV',
    comments: process.env.NODE_ENV === 'production',
    caller: {
      name: 'nodejs'
    }
  })
}
