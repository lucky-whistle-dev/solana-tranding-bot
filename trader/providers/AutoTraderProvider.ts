import { LogProvider } from '@core/providers/LogProvider';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { TokenPriceObject, TokenPriceRequestPayload } from '@common/types/token/TokenPrice';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';


export class AutoTraderProvider {
  constructor(
    private signalGenerator: BaseSignalGeneratorProvider,
    private tokenPriceProvider: TokenPriceProvider,
    private tokenSwapProvider: TokenSwapProvider,
    private zLog: LogProvider = new LogProvider(AutoTraderProvider.name)
  ) {}

  async start(request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.tokenPriceProvider.startPriceListener('price_data', request);
    this.tokenPriceProvider.onPriceData('price_data', async priceData => {
      if (priceData.type !== 'WELCOME') {
        this.zLog.info(`price data: ${JSON.stringify(priceData, null, 2)}`);
        const signal = await this.signalGenerator.start(priceData.data.c);
        this.zLog.debug(`SIGNAL --> ${signal}`);
      }
    });
  }
}