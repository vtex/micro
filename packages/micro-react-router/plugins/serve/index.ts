import { HtmlPlugin } from '@vtex/micro-core/lib'
import { createElement } from 'react'
import { StaticRouter } from 'react-router-dom'

class Html extends HtmlPlugin<JSX.Element> {
  public render = (children: JSX.Element | null): JSX.Element => {
    const location = this.options.page.data.path
    return createElement(StaticRouter, { location, children } as any)
  }
}

export default {
  html: Html
}
