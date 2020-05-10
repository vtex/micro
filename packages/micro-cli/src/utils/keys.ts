export const keys = <T>(obj: T) => Object.keys(obj) as (keyof T)[]
