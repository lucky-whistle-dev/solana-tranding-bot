import { getMilliseconds } from 'date-fns';

import { LogProvider } from '@core/providers/LogProvider';
import { envLoader } from '@common/EnvLoader';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { TokenPriceObject, TokenPriceRequestPayload } from '@common/types/token/TokenPrice';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';
import { SimulationProvider } from '@trader/providers/SimulationProvider';
import { SignalGeneratorRegistry } from '@signals/SignalGeneratorRegistry';


export class AutoTraderProvider {
  constructor(
    private signalGenerator: BaseSignalGeneratorProvider,
    private simProvider: SimulationProvider,
    private tokenPriceProvider: TokenPriceProvider,
    private zLog: LogProvider = new LogProvider(AutoTraderProvider.name)
  ) {}

  async start(request: TokenPriceObject<TokenPriceRequestPayload>) {
    const mode = envLoader.SELECTED_MODE;
    if (mode === 'offline') { 
      this.zLog.debug('trader service has been set to offline, exitting...')
      process.exit(1);
    }

    if (mode === 'simHistorical') { 
      this.zLog.debug('running historical trade simulation')
      const day7Period = 7 * 24 * 60 * 60 * 1000;

      const simResults = await this.simProvider.simulateHistoricalTrades({ 
        simulationType: 'historical', 
        simulationTimeInMs: day7Period,
        audit: { persistOnCompletion: true },
        riskAversionGrade: 5,
        portfolioSize: 10000
      });

      this.zLog.debug(`simulation results for historical data: ${JSON.stringify(simResults, null, 2)}`);
      
      process.exit(0);
    }

    if (mode === 'simLive') await this.simProvider
    this.tokenPriceProvider.startPriceListener('price_data', request);
    this.tokenPriceProvider.onPriceData('price_data', async priceData => {
      if (priceData.type !== 'WELCOME') {
        this.zLog.info(`price data: ${JSON.stringify(priceData, null, 2)}`);
        const { signal, stats } = await this.signalGenerator.start(priceData.data.c);
        this.zLog.debug(`SIGNAL --> ${signal}`);

        if (mode === 'simLive') this.simProvider.simulateLiveTrades(signal, stats);
        if (mode === 'production') this.zLog.debug('production unimplemented')
      }
    });
  }
}