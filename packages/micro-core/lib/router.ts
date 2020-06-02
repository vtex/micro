import { ResolvedPage, Serializable } from '../components/page';

interface MicroRequest {
  path: string
  query: Record<string, string>
}

interface ResolvedRedirect {
  location: string
  status: 301 | 302
}

type Resolved<T extends Serializable> = ResolvedPage<T> | ResolvedRedirect

export const isResolvedPage = <T extends Serializable>(obj: Resolved<T>): obj is ResolvedPage<T> =>
  typeof (obj as any).name === 'string';

export const isResolvedRedirect = <T extends Serializable>(obj: Resolved<T>): obj is ResolvedRedirect =>
  typeof (obj as any).location === 'string';

export interface Page {
  name: string
}

export type Router<T extends Serializable> = (
  request: MicroRequest,
  pages: Record<string, Page>
) => Promise<Resolved<T>>
