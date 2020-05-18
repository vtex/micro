interface MicroRequest {
  path: string
}

type Serializable = object | string | number | null | undefined

export interface ResolvedPage {
  name: string
  data: Serializable
  status: number
}

interface ResolvedRedirect {
  location: string
  status: 301 | 302
}

type Resolved = ResolvedPage | ResolvedRedirect

export const isResolvedPage = (obj: Resolved): obj is ResolvedPage => typeof (obj as any).name === 'string'

export const isResolvedRedirect = (obj: Resolved): obj is ResolvedRedirect => typeof (obj as any).location === 'string'

export interface Page {
  name: string
}

export type Router = (
  request: MicroRequest,
  pages: Record<string, Page>
) => Promise<Resolved>
