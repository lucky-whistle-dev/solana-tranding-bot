import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { ExecuteTradeProvider } from '@trader/providers/ExecuteTradeProvider';
import { TokenPriceObject, TokenPriceRequestPayload } from '@common/types/token/TokenPrice';


export class AutoTradeProvider {
  private executeTradeProvider: ExecuteTradeProvider;

  constructor(
    private etcdProvider: ETCDProvider,
    private tokenPriceProvider: TokenPriceProvider,
    private tokenSwapProvider: TokenSwapProvider,
    private zLog: LogProvider = new LogProvider(AutoTradeProvider.name)
  ) { /* this.executeTradeProvider = new ExecuteTradeProvider(this.etcdProvider, this.tokenSwapProvider); */ }

  async start(request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.tokenPriceProvider.startPriceListener('price_data', request);
    this.tokenPriceProvider.onPriceData('price_data', async priceData => {
      if (priceData.type !== 'WELCOME') {
        this.zLog.info(`price data: ${JSON.stringify(priceData, null, 2)}`);
        // await this.executeTradeProvider.run(priceData.data.c);
      }
    });
  }
}