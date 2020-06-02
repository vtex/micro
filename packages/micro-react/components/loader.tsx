import { loadableReady } from '@loadable/component'
import { canUseDOM } from 'exenv'
import React, { StrictMode } from 'react'
import { hydrate, render } from 'react-dom'

import { getAppContainer } from './container'
import { Runtime } from './context/Runtime'
import { getPageData } from './data'
import { once } from './once'
import { getRuntimeData } from './runtime'

const printPerformance = () => {
  const timing = window.performance?.timing
  if (!timing) {
    return
  }
  const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
  const loaded = timing.loadEventEnd - timing.navigationStart
  console.log(`[micro-react]: ⚡⚡ DomContentLoaded ${domContentLoaded / 1e3}ms`)
  console.log(`[micro-react]: ⚡⚡ Load ${loaded / 1e3}ms`)
}

const renderOrHydrate = (App: React.ReactType) => async () => {
  const container = getAppContainer()
  const runtimeData = getRuntimeData()

  // This should be preloaded by now
  let error = null
  const data = await getPageData().catch(err => { error = err })

  const AppWithContext = (
    <StrictMode>
      <Runtime.Provider value={runtimeData}>
        <App data={data} error={error} />
      </Runtime.Provider>
    </StrictMode>
  )

  if (container.children.length > 0) {
    const msg = '[micro-react]: ⚡⚡ Hydration took'
    console.time(msg)
    console.log('hydrationStart', (Date.now() - window.performance.timing.navigationStart) / 1e3)
    hydrate(AppWithContext, container)
    console.timeEnd(msg)
  } else {
    const msg = '[micro-react]: ⚡ Rendering took'
    console.time(msg)
    console.log('renderStart', (Date.now() - window.performance.timing.navigationStart) / 1e3)
    render(AppWithContext, container)
    console.timeEnd(msg)
  }

  printPerformance()
}

export const LoadMicroComponent = (App: React.ReactType) => {
  if (canUseDOM) {
    const renderOnce = once(renderOrHydrate(App))
    setTimeout(renderOnce, 6e3)

    if (document.readyState !== 'complete') {
      window.onload = () => loadableReady(renderOnce)
    } else {
      loadableReady(renderOnce)
    }
  }
  return App
}
