import { OnRequestPlugin } from '@vtex/micro/framework'
import { createElement } from 'react'
import { StaticRouter } from 'react-router-dom'

export class OnRequest extends OnRequestPlugin<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.path

    return createElement(StaticRouter, { location, children } as any)
  }
}
