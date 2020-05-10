import crypto from 'crypto'

export const md5 = (obj: any) => crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
