import { subDays } from 'date-fns';

import { BaseSoltIO } from '@toolset/SoltIO/BaseSoltIO';

import { envLoader } from '@common/EnvLoader';
import { TokenHistoryProvider } from '@common/providers/token/TokenHistoryProvider';


export class TestTokenHistoryProvider extends BaseSoltIO {
  constructor() { super(); }

  async runTest(): Promise<boolean> {
    const tpHistoryProvider = new TokenHistoryProvider(envLoader.BIRDEYE_API_KEY, 'solana');

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const resp = await tpHistoryProvider.getTokenPriceHistory({
      address: envLoader.TOKEN_ADDRESS,
      address_type: 'token',
      type: '5m',
      time_from: sevenDaysAgo,
      time_to: now
    });

    this.zLog.debug(`resp: ${JSON.stringify(resp, null, 2)}`);
    return true;
  }
}


new TestTokenHistoryProvider().start().then(res => {
  console.log('res:', res);
  process.exit(0);
}).catch(err => {
  console.log('err:', err);
  process.exit(1);
});