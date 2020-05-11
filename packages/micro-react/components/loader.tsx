import { loadableReady } from '@loadable/component'
import { canUseDOM } from 'exenv'
import React from 'react'
import { hydrate, render } from 'react-dom'
import { hot } from 'react-hot-loader/root'

import { PageData } from '../utils/pageData'
import { Runtime } from '../utils/runtime'
import { Runtime as MicroRuntime } from './context/Runtime'

const renderOrHydrate = (App: React.ReactType) => async () => {
  const runtime = new Runtime()
  const container = runtime.getContainer()
  const runtimeData = runtime.hydrate()

  // This should be preloaded by now
  let error = null
  const context = await new PageData().fetch().catch(err => { error = err })

  const AppWithContext = (
    <MicroRuntime.Provider value={runtimeData}>
      <App context={context} error={error} />
    </MicroRuntime.Provider>
  )

  if (container.children.length > 0) {
    console.log('✨✨ Hydrating Micro ...')
    hydrate(AppWithContext, container)
  } else {
    console.log('✨ Rendering Micro ...')
    render(AppWithContext, container)
  }
}

export const LoadMicroComponent = (App: React.ReactType) => {
  if (canUseDOM) {
    loadableReady(() => {
      window.onload = renderOrHydrate(hot(App))
    })
  }
  return App
}
