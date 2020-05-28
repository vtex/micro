import { OnRequestPlugin } from '@vtex/micro'
import { createElement } from 'react'
import { IntlProvider } from 'react-intl'

export default class OnRequest extends OnRequestPlugin<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.path
    return createElement(IntlProvider, { location, children })
  }
}
