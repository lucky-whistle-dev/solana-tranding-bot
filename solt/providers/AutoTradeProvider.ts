import { LogProvider } from '@core/providers/LogProvider';
import { TokenPriceProvider } from '@solt/providers/token/TokenPriceProvider';
import { TokenSwaprovider } from '@solt/providers/token/TokenSwapProvider';
import { TokenPriceObject, TokenPriceRequestPayload } from '@solt/types/TokenPrice';

export class AutoTradeProvider {
  constructor(
    private tokenPriceProvider: TokenPriceProvider,
    private tokenSwapProvider: TokenSwaprovider,
    private zLog: LogProvider = new LogProvider(AutoTradeProvider.name)
  ) {}

  async start(request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.tokenPriceProvider.startPriceListener('price_data', request);
    this.tokenPriceProvider.onPriceData('price_data', async priceData => {
      this.zLog.info(`price data: ${JSON.stringify(priceData, null, 2)}`);
      //  await this.tokenSwapProvider.swap(null);
    });
  }
}