import { canUseDOM } from 'exenv'

import { PublicPaths } from '@vtex/micro-core'

export interface RuntimeData {
  publicPaths: PublicPaths
}

const runtimeContainerId = '__MICRO_REACT_RUNTIME__'

export const withRuntimeTags = (runtime: RuntimeData) =>
  `<script id="${runtimeContainerId}" type="application/json">${JSON.stringify(
    runtime.publicPaths
  )}</script>`

const isRuntimeData = (obj: any): obj is RuntimeData => {
  const paths = obj?.publicPaths
  return typeof paths?.assets === 'string' && typeof paths?.data === 'string'
}

const ensureRuntime = (obj: any): RuntimeData => {
  if (!isRuntimeData(obj)) {
    throw new Error(
      `💣 Error while validating runtime data ${JSON.stringify(obj)}`
    )
  }
  return obj
}

export const getRuntimeData = () => {
  console.assert(
    canUseDOM,
    '💣 Runtime hydration can only be run on the browser'
  )
  const dataElement = document.getElementById(runtimeContainerId)
  const maybeRuntime = JSON.parse(dataElement?.textContent ?? '{}')
  return ensureRuntime({ publicPaths: maybeRuntime })
}
