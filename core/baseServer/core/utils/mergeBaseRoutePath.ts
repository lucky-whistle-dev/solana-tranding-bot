import { join } from 'path';


export const mergeBaseRoutePath = (prefix: string, suffix: string) => join(prefix, suffix);