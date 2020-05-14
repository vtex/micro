import { canUseDOM } from 'exenv'

import { join } from './path'

const id = '__MICRO_PAGE_DATA__'

export const getPageData = () => {
  if (!canUseDOM) {
    throw new Error('💣 PageData fetch can only be run on the browser')
  }

  let maybeDataPath
  const dataElement = document.getElementById(id)
  if (typeof (dataElement as any)?.href === 'string') {
    maybeDataPath = (dataElement as any)?.href
    return fetch(maybeDataPath)
      .then(res => res.json())
  }

  return null
}

export const withPageDataTags = (pageName: string, pageData: any, dataRootPath: string, path: string) => pageData !== undefined
  ? `<link id="${id}" data-chunk="${pageName}" rel="preload" as="fetch" href="${join(dataRootPath, path)}" crossorigin="anonymous">`
  : ''
