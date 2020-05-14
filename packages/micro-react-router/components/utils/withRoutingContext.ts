export type RouterResolvedEntry<T> = {
  path: string
  data: T
}

// export const withRoutingContext = <T>({
//   context,
//   entry,
//   status,
//   path
// }: ResolvedEntry<T>): RouterResolvedEntry<T> => {
//   return {
//     context: {
//       entrypoint: entry,
//       path,
//       context
//     },
//     entry,
//     status,
//     path
//   }
// }
