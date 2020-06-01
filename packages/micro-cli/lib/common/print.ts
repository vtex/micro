import { inspect } from 'util';

export const prettyPrint = (obj: any) => {
  console.log(inspect(obj, false, 100, true));
};
