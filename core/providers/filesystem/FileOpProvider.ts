import { promisify } from 'util';
import { writeFile, existsSync, readFile, mkdir, appendFile, WriteFileOptions } from 'fs';

import { LogProvider } from '@core/providers/LogProvider';


export const asyncWriteFile = promisify(writeFile);
export const asyncReadFile = promisify(readFile);
export const asyncMkdir = promisify(mkdir);
export const asyncAppendFile = promisify(appendFile);


/*
  File Operation Helper Class
*/
export class FileOpProvider {
  private zLog = new LogProvider('File Op Provider');
  constructor() {}

  exists(pathForFile: string): boolean {
    try { return existsSync(pathForFile); } 
    catch (err) { throw err; }
  }

  async mkdir(path: string): Promise<boolean> {
    try { 
      await asyncMkdir(path);

      return true;
    } catch (err) { throw err; }
  }

  async readFile(fileName: string, opts?: { encoding?: any, flag?: any }): Promise<Buffer> {
    try {
      this.zLog.info(`Attempting to read file: ${fileName}`);
      const res = await asyncReadFile(fileName, opts);

      return res;
    } catch (err) { throw err; }  
  }

  async writeFile(fileName: string, payload: string, opts?: WriteFileOptions) {
    await asyncWriteFile(fileName, payload, opts);
    return true;
  }
}