import { got } from 'got';

import { sleep, extractErrorMessage } from '@core/utils/Utils';
import { LogProvider } from '@core/providers/LogProvider';


const zLog = new LogProvider('Async Exponential Backoff');

export async function asyncExponentialBackoff(
  endpoint: string,
  retries: number, 
  timeout: number,
  options: any,
  depth = 1): Promise<any> {
  try {
    if (depth > retries) throw new Error(`Exceeded Max Retries: ${retries}`);
    
    const resp = await got.post(endpoint, options);
    return resp.body;
  } catch (err) {
    if (depth > retries) throw err;
    else {
      zLog.error(`Error Stack ${extractErrorMessage(err)}\n`);
      const newTimeout = 2 ** (depth - 1) * timeout;

      zLog.info(`Moving to attempt: ${depth}`);
      zLog.info(`Waiting for: ${newTimeout}ms\n`);

      await sleep(newTimeout);

      return await asyncExponentialBackoff(endpoint, retries, timeout, options, depth + 1);
    }
  }
}