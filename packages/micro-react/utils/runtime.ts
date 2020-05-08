import { canUseDOM } from 'exenv'

import { PublicPaths } from './paths'

export interface RuntimeData {
  paths: PublicPaths
}

const isRuntimeData = (obj: any): obj is RuntimeData => {
  const paths = obj?.paths
  return paths 
    && typeof paths?.assets === 'string'
    && typeof paths?.entry === 'string'
    && typeof paths?.context === 'string'
}

const ensureRuntime = (obj: any): RuntimeData => {
  if (!isRuntimeData(obj)) {
    throw new Error(`💣 Error while validating runtime data ${obj}`)
  }
  return obj
}

export class Runtime {
  private id = '__MICRO_RUNTIME__'
  private containerId = 'micro-root'
  private runtime: RuntimeData | null = null

  constructor() {}

  public hydrate () {
    if (!canUseDOM) {
      throw new Error('💣 Runtime hydration can only be run on the browser')
    }

    let maybeRuntime
    const dataElement = document.getElementById(this.id)
    if (dataElement?.textContent) {
      maybeRuntime = JSON.parse(dataElement.textContent)
    }

    this.runtime = ensureRuntime(maybeRuntime)
    
    return this.runtime
  }

  public setRuntime (r: RuntimeData) {
    this.runtime = ensureRuntime(r)
  }

  public getContainer () {
    const container = document.getElementById(this.containerId)
    if (!container) {
      throw new Error('Something went wrong while loading the container')
    }
    return container
  }

  public wrapContainer (body: string) {
    return `<div id="${this.containerId}">${body}</div>`
  }

  public getScriptTags () {
    const runtime = JSON.stringify(ensureRuntime(this.runtime))
    return `<script id="${this.id}" type="application/json">${runtime}</script>`
  }
}