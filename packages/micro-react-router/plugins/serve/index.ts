import { ServePlugin } from '@vtex/micro-core'
import { createElement } from 'react'
import { StaticRouter } from 'react-router-dom'

export default class Serve extends ServePlugin<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.page.data.path
    return createElement(StaticRouter, { location, children } as any)
  }
}
