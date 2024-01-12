import { BaseSoltIO } from '@toolset/SoltIO/BaseSoltIO';
import { TokenPriceProvider } from 'common/providers/token/TokenPriceProvider';
import { PriceEvent} from '@common/types/token/TokenPrice';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';
import { TokenHistoryProvider } from 'common/providers/token/TokenHistoryProvider';


export class TestTokenHistoryProvider extends BaseSoltIO {
  constructor() { super(); }

  async runTest(): Promise<boolean> {
    const tpHistoryProvider = new TokenHistoryProvider(BIRDEYE_API_KEY, 'solana');

    const resp = await tpHistoryProvider.getTokenPriceHistory({
      address: SOL_TOKEN_ADDRESS,
      address_type: 'token',
      type: '1d',
      time_from: 0,
      time_to: 1
    });

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