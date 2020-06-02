export type Serializable = object | string | number | null | undefined

export interface ResolvedPage<T extends Serializable> {
  name: string
  data: T
  status: number
}

export interface ResolvedRedirect {
  location: string
  status: 301 | 302
}
