import { canUseDOM } from 'exenv'

import { Page, PublicPaths } from '@vtex/micro-core'

export interface RuntimeData {
  publicPaths: PublicPaths
  page: {
    name: string
  }
}

const runtimeContainerId = '__MICRO_REACT_RUNTIME__'

export const withRuntimeTags = ({ publicPaths, page: { name } }: RuntimeData) =>
  `<script id="${runtimeContainerId}" type="application/json">${JSON.stringify({
    publicPaths,
    page: { name },
  })}</script>`

const isRuntimeData = (obj: any): obj is RuntimeData => {
  const paths = obj?.publicPaths
  return (
    typeof paths?.assets === 'string' &&
    typeof paths?.data === 'string' &&
    typeof obj?.page?.name === 'string'
  )
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
  return ensureRuntime(maybeRuntime)
}
