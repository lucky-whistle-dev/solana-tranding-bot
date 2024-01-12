import { LogProvider } from '@core/providers/LogProvider';
import { sleep, extractErrorMessage } from '@core/utils/Utils';
import { AsyncExponentialBackoff, BackoffRequestType } from '@core/types/AsyncExponentialBackoff';


const zLog = new LogProvider('Async Exponential Backoff');

export const asyncExponentialBackoff: AsyncExponentialBackoff = async <T extends BackoffRequestType>(
  endpoint: string, retries: number, timeout: number, request: T, depth = 1
): Promise<Response> => {
  try {
    if (depth > retries) throw new Error(`Exceeded Max Retries: ${retries}`);
    return fetch(endpoint, request);
  } catch (err) {
    zLog.error(extractErrorMessage(err));
    if (depth > retries) throw err;
    
    const updatedTimeout = ((): number => 2 ** (depth - 1) * timeout)();
    await sleep(updatedTimeout);

    zLog.info(`Waited for: ${updatedTimeout}ms`);
    zLog.info(`Moving to attempt: ${depth + 1}`);

    return asyncExponentialBackoff(endpoint, retries, updatedTimeout, request, depth + 1);
  }
};