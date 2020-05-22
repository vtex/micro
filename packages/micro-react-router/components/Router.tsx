import { LoadableComponent } from '@loadable/component'
import { canUseDOM } from '@vtex/micro'
import { Runtime } from '@vtex/micro-react'
import React, { useContext, useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import { FetchCurrentPage } from './Page'
import { Page, PagesManager } from './Pages/index'
import { Pages as PagesWeb } from './Pages/browser'
import { Pages as PagesSSR } from './Pages/ssr'

export interface PageProps {
  data: any
}

export interface AsyncPageProps extends PageProps {
  name: string
}

interface RouterProps {
  data: Page
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
  return ({ data }) => {
    const runtime = useContext(Runtime)
    const [pages, setPages] = useState([] as Page[])

    pagesWeb.initialize(runtime, setPages, data)

    if (canUseDOM) {
      return (
        <PagesContext.Provider value={pagesWeb}>
          <BrowserRouter>
            <Switch>
              <Route exact path={data.path}>
                <InitialPage data={data.data} />
              </Route>

              {pages.map(({ path, data, name }) => (
                <Route exact path={path} key={path}>
                  <AsyncPage name={name} data={data} fallback={<div>loading...</div>}/>
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
          <InitialPage data={data.data} />
        </PagesContext.Provider>
      )
    }
  }
}
