declare module 'findhelp' {
  function find (tree: any, args: any): any
  function run (...args: any[]): Promise<any>
  function help (...args: any[]): any

  export class CommandNotFoundError extends Error {}
  export class MissingRequiredArgsError extends Error {}
}
