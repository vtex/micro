import { LoadableComponent } from '@loadable/component'
import { canUseDOM } from '@vtex/micro'
import { Runtime } from '@vtex/micro-react'
import React, { useContext, useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import { FetchCurrentPage } from './Page'
import { Page, PagesManager } from './Pages'
import { Pages as PagesWeb } from './Pages/browser'
import { Pages as PagesSSR } from './Pages/ssr'

export interface PageProps {
  context: any
}

export interface AsyncPageProps extends PageProps {
  entrypoint: string
}

interface RouterProps {
  context: Page
  error: any
}

export const PagesContext = React.createContext<PagesManager | null>(null)
PagesContext.displayName = 'PagesManagerContext'

const pagesWeb = new PagesWeb()
const pagesSSR = new PagesSSR()

export const withRouter = (
  InitialPage: React.ElementType<PageProps>,
  AsyncPage: LoadableComponent<AsyncPageProps>
): React.SFC<RouterProps> => {
  return ({ context }) => {
    const runtime = useContext(Runtime)
    const [pages, setPages] = useState([] as Page[])

    pagesWeb.initialize(runtime, setPages, context)

    if (canUseDOM) {
      return (
        <PagesContext.Provider value={pagesWeb}>
          <BrowserRouter>
            <Switch>
              <Route exact path={context.path}>
                <InitialPage context={context.context} />
              </Route>

              {pages.map(({ path, context, entrypoint }) => (
                <Route exact path={path} key={path}>
                  <AsyncPage entrypoint={entrypoint} context={context} fallback={<div>loading...</div>}/>
                </Route>
              ))}

              {/* No Route Match, let's fetch this page */}
              <Route path="*">
                <FetchCurrentPage>
                  <div>Maybe loading page</div>
                </FetchCurrentPage >
              </Route>
            </Switch>
          </BrowserRouter>
        </PagesContext.Provider>
      )
    } else {
      // On SSR, we already know what we should render by this point
      return (
        <PagesContext.Provider value={pagesSSR}>
          <InitialPage context={context.context} />
        </PagesContext.Provider>
      )
    }
  }
}
