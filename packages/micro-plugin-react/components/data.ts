import { canUseDOM } from 'exenv'

import { join } from './path'

const id = '__MICRO_PAGE_DATA__'

export const getPageData = async () => {
  if (!canUseDOM) {
    throw new Error('💣 PageData fetch can only be run on the browser')
  }

  const dataElement = document.getElementById(id)
  if (typeof (dataElement as any)?.href === 'string') {
    const maybeDataPath = (dataElement as any)?.href
    const response = await fetch(maybeDataPath)
    return response.json()
  }

  return null
}

export const withPageDataTags = ({
  name,
  data,
  rootPath,
  path,
}: {
  name: string
  data: any
  rootPath: string
  path: string
}) => {
  if (data === undefined) {
    return ''
  }
  const href = join(rootPath, path)
  return `<link id="${id}" data-chunk="${name}" rel="preload" as="fetch" href="${href}" crossorigin="anonymous">`
}
