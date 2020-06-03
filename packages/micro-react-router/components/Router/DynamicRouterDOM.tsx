import { LoadableComponent } from '@loadable/component'
import {
  inflight,
  join,
  Runtime,
  RuntimeData,
} from '@vtex/micro-react/components'
import { LocationDescriptorObject } from 'history'
import React from 'react'
import { matchPath, Route, useLocation } from 'react-router-dom'

import { FetchCurrentPage, isPage, Page } from '../Page'
import {
  AsyncPageProps,
  MicroRouterContext,
  PageProps,
  RouterProps,
  RouterStateModifier,
} from './Router'

interface RouterState extends RouterStateModifier {
  assets: Set<string>
  // null if page was loaded with error, Page sucessfully, undefined if not prefetched
  pages: Map<string, Page>
}

interface RouterDOMProps extends RouterProps {
  runtime: RuntimeData // root paths to prefetch
  location: LocationDescriptorObject // window location
  InitialPage: React.ElementType<PageProps> // Page that was SSR
  AsyncPage: LoadableComponent<AsyncPageProps> // Async Page loader
}

class PrivateRouterDOM extends React.Component<RouterDOMProps, RouterState> {
  constructor(props: RouterDOMProps) {
    super(props)
    this.state = {
      prefetchPage: this.prefetchPage,
      preloadPage: this.preloadPage,
      pages: new Map(),
      assets: new Set(),
    }
  }

  public prefetchPage = async (location: LocationDescriptorObject) => {
    const isInitialPage = location.pathname === this.props.data.path
    if (location.pathname && !isInitialPage) {
      if (!this.state.pages.has(location.pathname)) {
        return this.loadPage(location)
      }
    }
  }

  public preloadPage = async (location: LocationDescriptorObject) => {
    const isInitialPage = location.pathname === this.props.data.path
    if (location.pathname && !isInitialPage) {
      if (!this.state.pages.has(location.pathname)) {
        return this.loadPage(location)
      }
    }
  }

  public loadAsset = async (page: Page) => {
    const alreadyLoaded = this.state.assets.has(page.name)
    const isInitialPage = page.name === this.props.data.name
    if (alreadyLoaded || isInitialPage) {
      return
    }
    await inflight(
      page.name,
      async () =>
        new Promise((resolve) => {
          this.setState((state) => {
            this.props.AsyncPage.preload(page)
            state.assets.add(page.name)
            resolve()
            return state
          })
        })
    )
  }

  protected async loadPage(location: LocationDescriptorObject): Promise<any> {
    const path = this.locationToPath(location) || ''
    return inflight(path, async () => {
      const page = await fetch(path).then((r) => r.json())
      if (isPage(page)) {
        this.updatePages(page.path, page)
        this.loadAsset(page)
      } else {
        throw new Error(
          `💣 Fetched location was not a valid page: ${location.pathname}`
        )
      }
    })
  }

  protected updatePages = (path: string, page: Page) =>
    this.setState((state) => {
      state.pages.set(path, page)
      return state
    })

  protected locationToPath = (location: LocationDescriptorObject) => {
    if (typeof location.pathname !== 'string') {
      throw new Error('💣 You need a pathname for fecthing a page')
    }
    return join(this.props.runtime.publicPaths.data, location.pathname)
  }

  public render = () => {
    const { data, InitialPage, AsyncPage, location } = this.props
    const { pages } = this.state

    const isInitialPage = matchPath(location.pathname ?? '', {
      ...data,
      exact: true,
      strict: false,
    })

    if (isInitialPage) {
      return (
        <MicroRouterContext.Provider value={this.state}>
          <Route path={location.pathname}>
            <InitialPage data={data.data} />
          </Route>
        </MicroRouterContext.Provider>
      )
    }

    // Iterate over the pages map and find a match
    // I think we could improve this algorithm, but YoLo
    let matched: Page | null = null
    for (const [, page] of pages) {
      const m = matchPath(location.pathname ?? '', {
        ...page,
        exact: true,
        strict: false,
      })
      if (m) {
        matched = page
        break
      }
    }

    if (!matched) {
      return (
        <MicroRouterContext.Provider value={this.state}>
          <Route path={location.pathname}>
            <FetchCurrentPage />
          </Route>
        </MicroRouterContext.Provider>
      )
    }

    return (
      <MicroRouterContext.Provider value={this.state}>
        <Route path={location.pathname}>
          <AsyncPage data={matched.data} name={matched.name} />
        </Route>
      </MicroRouterContext.Provider>
    )
  }
}

type InjectionProps = Omit<RouterDOMProps, 'runtime' | 'location'>

// PrivateRouterDOM required location and runtime. Since this is the
// only I know how to inject runtime and location to it, I've created
// this simple component
export const RouterDOM: React.SFC<InjectionProps> = ({
  data,
  error,
  InitialPage,
  AsyncPage,
}) => {
  const location = useLocation()
  const runtime = React.useContext(Runtime)

  return (
    <PrivateRouterDOM
      runtime={runtime}
      location={location}
      data={data}
      error={error}
      InitialPage={InitialPage}
      AsyncPage={AsyncPage}
    />
  )
}
