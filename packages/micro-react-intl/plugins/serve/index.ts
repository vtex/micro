import { ServePlugin } from '@vtex/micro-core'
import { createElement } from 'react'
import { IntlProvider } from 'react-intl'

export default class Serve extends ServePlugin<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.path
    // TODO: Fix this as any
    return createElement(IntlProvider as any, { location, children })
  }
}
