import { BaseSoltIO } from '@toolset/SoltIO/BaseSoltIO';

import { TokenPriceProvider } from '@common/providers/TokenPriceProvider';
import { PriceEvent } from '@common/types/TokenPrice';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';


export class TestTokenPriceProvider extends BaseSoltIO {
  constructor() { super(); }

  async runTest(): Promise<boolean> {
    const event: PriceEvent = 'price_data';
    const tpProvider = new TokenPriceProvider(BIRDEYE_API_KEY, 'solana');
    
    tpProvider.startPriceListener(event, {
      type: 'SUBSCRIBE_PRICE',
      data: {
        queryType: 'simple',
        chartType: '5m',
        address: SOL_TOKEN_ADDRESS,
        currency: 'usd'
      }
    });

    tpProvider.onPriceData('price_data', priceData => this.zLog.info(`price data: ${JSON.stringify(priceData)}`) );
    return true;
  }
}

new TestTokenPriceProvider().start().then(res => {
  console.log('res:', res);
  process.exit(0);
}).catch(err => {
  console.log('err:', err);
  process.exit(1);
});