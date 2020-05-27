import { OnRequestPlugin } from '@vtex/micro'
import { createElement } from 'react'
import { StaticRouter } from 'react-router-dom'

export default class OnRequest extends OnRequestPlugin<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.path
    return createElement(StaticRouter, { location, children } as any)
  }
}
