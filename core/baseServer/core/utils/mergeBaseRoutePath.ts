import { join } from 'path';


export const mergeBaseRoutePath = (prefix: string, suffix: string) => {
  return join(prefix, suffix);
}