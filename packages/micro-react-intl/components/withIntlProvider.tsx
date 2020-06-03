import React from 'react'
import { IntlProvider } from 'react-intl'

export type Messages = Record<string, string>

export interface PageProps {
  data: any
  error: any
}

export const withIntlProvider = (
  Page: React.ElementType<PageProps>,
  messages: Messages,
  locale: string
): React.SFC<PageProps> => {
  return function MicroReactIntl({ data, error }) {
    return (
      <IntlProvider messages={messages} locale={locale} key={locale}>
        <Page data={data} error={error} />
      </IntlProvider>
    )
  }
}
