import { LoadableComponent } from '@loadable/component'
import { join } from '@vtex/micro'
import { RuntimeData, Runtime } from '@vtex/micro-react'
import { LocationDescriptorObject } from 'history'
import React from 'react'
import { matchPath, Route, useLocation } from 'react-router-dom'

import { FetchCurrentPage, isPage, Page } from '../Page'
import { inflight } from '../utils/inflight'
import {
  AsyncPageProps,
  MicroRouterContext,
  PageProps,
  RouterProps,
  RouterStateModifier
} from './Router'

interface RouterState extends RouterStateModifier {
  pages: Page[]
  assetsByPage: Record<string, LoadableComponent<AsyncPageProps>>
}

interface RouterDOMProps extends RouterProps {
  runtime: RuntimeData
  location: LocationDescriptorObject
  InitialPage: React.ElementType<PageProps>
  AsyncPage: LoadableComponent<AsyncPageProps>
}

class PrivateRouterDOM extends React.Component<RouterDOMProps, RouterState> {
  constructor (props: RouterDOMProps) {
    super(props)
    this.state = {
      prefetchAsset: this.prefetchAsset,
      prefetchPage: this.prefetchPage,
      fetchPage: this.fetchPage,
      pages: [],
      assetsByPage: {}
    }
  }

  public prefetchPage = async (location: LocationDescriptorObject) => {
    this.fetchPage(location)
  }

  public fetchPage = async (location: LocationDescriptorObject) => {
    if (location.pathname) {
      const found = this.findPage(location.pathname)
      if (!found) {
        await this.fetchAndUpdate(location)
      }
    }
  }

  public prefetchAsset = async (name: string) => {
    console.log('📕 not implemented', name)
  }

  protected findPage = (path: string) => this.state.pages.find(
    p => p.path === path
  )

  protected async fetchAndUpdate (location: LocationDescriptorObject): Promise<any> {
    const path = this.locationToPath(location) || ''
    return inflight(path, async () => {
      const response = await fetch(path)
      const page = await response.json()
      if (isPage(page)) {
        this.prefetchAsset(page.name)
        this.setState(state => {
          const found = state.pages.find(p => p.path === path)
          if (!found) { // Avoid reinserting the same page multiple times
            state.pages.push(page)
          }
          return state
        })
      } else {
        throw new Error(`💣 Fetched location was not a valid page: ${location.pathname}`)
      }
    })
  }

  protected locationToPath = (location: LocationDescriptorObject) => {
    if (typeof location.pathname !== 'string') {
      throw new Error('💣 You need a pathname for fecthing a page')
    }
    return join(this.props.runtime.publicPaths.data, location.pathname)
  }

  public render = () => {
    const { data, InitialPage, AsyncPage, location } = this.props
    const { pages } = this.state

    const isInitialPage = matchPath(location.pathname || '', { ...data, exact: true, strict: false })

    if (isInitialPage) {
      return (
        <MicroRouterContext.Provider value={this.state}>
          <Route path={data.path}>
            <InitialPage data={data.data} />
          </Route>
        </MicroRouterContext.Provider>
      )
    }

    const matched = pages.find(
      page => matchPath(location.pathname || '', { ...page, exact: true, strict: false })
    )

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

export const RouterDOM: React.SFC<InjectionProps> = ({
  data,
  error,
  InitialPage,
  AsyncPage
}) => {
  const runtime = React.useContext(Runtime)
  const location = useLocation()

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
