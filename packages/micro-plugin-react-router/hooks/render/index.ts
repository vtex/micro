import React from 'react'
import * as ReactRouterDOM from 'react-router-dom'

import { RenderHook } from '@vtex/micro-core'

export default class Render extends RenderHook<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.page.data.path
    return React.createElement(ReactRouterDOM.StaticRouter, {
      location,
      children,
    } as any)
  }

  public getScriptTags = () => ''
  public getStyleTags = () => ''
  public getLinkTags = () => ''
  public getMetaTags = () => ''
}

;(global as any).ReactRouterDOM = ReactRouterDOM
