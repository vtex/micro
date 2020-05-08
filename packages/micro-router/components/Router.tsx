import { LoadableComponent } from '@loadable/component'
import { canUseDOM, Runtime } from '@vtex/micro-react/components'
import { join } from '@vtex/micro-react/utils'
import { LocationDescriptorObject } from 'history'
import React, { useContext, useState } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

export interface PageProps {
  context: any
}

export interface AsyncPageProps extends PageProps {
  entrypoint: string
}

export interface Page {
  entrypoint: string
  path: string
  context: string
}

interface RouterProps {
  context: Page
  error: any
}

const fetchPage = async (contextPath: string, location: LocationDescriptorObject): Promise<Page> => {
  if (!location.pathname) {
    throw new Error('💣 You need a pathname for fecthing a page')
  }
  const contextPathname = join(contextPath, location.pathname)
  const response = await fetch(contextPathname)
  return response.json()
}

interface RouterContext {
  prefetchPage: (location: LocationDescriptorObject) => Promise<void>
  fetchPage: (location: LocationDescriptorObject) => Promise<void>
}

export const Router = React.createContext<RouterContext>({
  prefetchPage: () => { throw new Error('PrefetchPage not implemented') },
  fetchPage: () => { throw new Error('PrefetchPage not implemented') },
})

const routerContextSSR: RouterContext = {
  prefetchPage: () => { throw new Error('PrefetchPage not allowed in SSR') },
  fetchPage: () => { throw new Error('PrefetchPage not allowed in SSR') },
}

export const withRouter = (
  InitialPage: React.ElementType<PageProps>,
  AsyncPage: LoadableComponent<AsyncPageProps>,
): React.SFC<RouterProps> => {
  return ({ context, error }) => {
    const [pages, addPage] = useState([] as Page[])
    const runtime = useContext(Runtime)
    
    const prefetchPage = async (location: LocationDescriptorObject) => {
      const exists = pages.find(x => x.path === location.pathname)
      if (!exists) {
        const page = await fetchPage(runtime.paths.context, location)
        // we need to add the page in the last position because of React Router's resolution algorithm
        addPage(pages => [...pages, page])
      }
    }

    if (canUseDOM) {
      return (
        <Router.Provider value={{prefetchPage, fetchPage: prefetchPage}}>
          <BrowserRouter>
            <Switch>
              <Route exact path={context.path}>
                <InitialPage context={context.context} />
              </Route>
              {pages.map(({ path, context, entrypoint }) => (
                <Route exact path={path}>
                  <AsyncPage entrypoint={entrypoint} context={context} fallback={<div>loading...</div>}/>
                </Route>
              ))}
              
              {/* No Route Match, a page should be loading now */}
              <Route path="*">
                <div>Maybe loading page</div>
              </Route>
            </Switch>
          </BrowserRouter>
        </Router.Provider>
      )
    } else {
      // On SSR, we already know what we should render by this point
      return (
        <Router.Provider value={routerContextSSR}>
          <Route exact path={context.path}>
            <InitialPage context={context.context} />
          </Route>
        </Router.Provider>
      )
    }
  }
}
