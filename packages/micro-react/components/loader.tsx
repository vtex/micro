import { loadableReady } from '@loadable/component'
import { canUseDOM, getPageData } from '@vtex/micro'
import React, { StrictMode } from 'react'
import { hydrate, render } from 'react-dom'

import { getAppContainer } from './container'
import { Runtime } from './context/Runtime'
import { once } from './once'
import { getRuntimeData } from './runtime'

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
    hydrate(AppWithContext, container)
    console.timeEnd(msg)
  } else {
    const msg = '[micro-react]: ⚡ Rendering took'
    console.time(msg)
    render(AppWithContext, container)
    console.timeEnd(msg)
  }
}

export const LoadMicroComponent = (App: React.ReactType) => {
  if (canUseDOM) {
    const renderOnce = once(renderOrHydrate(App))
    loadableReady(() => {
      // If the document is loading, let's wait untill it's loaded to start rendering
      if (document.readyState === 'loading') {
        window.onload = renderOnce
      } else {
        // The document is already loaded, let's render
        renderOnce()
      }
    })
  }
  return App
}
