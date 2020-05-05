import { loadableReady } from '@loadable/component'
import { canUseDOM } from 'exenv'
import React from 'react'
import { hydrate, render } from 'react-dom'

export const LoadMicroComponent = (App: React.ReactType) => {
  const renderOrHydrate = () => {
    const container = document.getElementById('micro')
    if (!container) {
      throw new Error('Something went wrong while loading the container')
    }

    if (container.children.length > 0) {
      console.log('Hydrating Micro ...')
      hydrate(<App />, container)
    } else {
      console.log('Rendering Micro ...')
      render(<App />, container)
    }
  }
  
  if (canUseDOM) {
    loadableReady(() => window.onload = renderOrHydrate)
  }

  return App
}