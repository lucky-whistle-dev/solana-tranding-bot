import { sub, subDays } from 'date-fns';
import lodash from 'lodash';
const { chunk, zip} = lodash;

import { envLoader } from '@common/EnvLoader';
import { StatsEntry, TokenStatsModel } from '@common/models/TokenStats';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { Signal } from '@common/types/Signal';
import { LogProvider } from '@core/providers/LogProvider';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';
import { SignalGeneratorRegistry } from '@signals/SignalGeneratorRegistry';
import { SimulationOpts, SimulationResults } from '@common/types/Trader';
import { ISODateString } from '@core/types/ISODate';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { convertISOToUnix } from '@core/utils/Utils';
import { InferType } from '@core/types/Infer';


export class SimulationProvider {
  private signalGenerator: BaseSignalGeneratorProvider;
  private opts: SimulationOpts;

  constructor(
    private auditProvider: AuditProvider,
    private tokenPriceProvider: TokenPriceProvider,
    private tokenStatsProvider: TokenStatsProvider,
    private zLog = new LogProvider(SimulationProvider.name)
  ) {}

  async setup(opts: SimulationOpts) {
    this.opts = opts;

    const generatorType = opts?.overrideSignalGenerator ? opts.overrideSignalGenerator : envLoader.SELECTED_SIGNAL_GENERATOR
    this.signalGenerator = SignalGeneratorRegistry.generators(this.auditProvider, this.tokenStatsProvider)[generatorType];
  }

  async simulateHistoricalTrades(opts: SimulationOpts): Promise<InferType<SimulationResults, 'REQUIRE ALL'>> {
    const start = new Date();
    const startKey: TokenStatsModel['KeyType'] = `tokenStats/${subDays(start, 32).toISOString() as ISODateString}`;
    const endKey: TokenStatsModel['KeyType'] = `tokenStats/${subDays(start, 1).toISOString() as ISODateString}`;
    
    const historicalStats = await this.tokenStatsProvider.range({ range: { start: startKey, end: endKey } });
    const historicalPrices = await this.tokenPriceProvider.getOHLC({ 
      address: envLoader.TOKEN_ADDRESS,
      type: '5m',
      time_from: subDays(start, 31),
      time_to: subDays(start, 1)
    });

    const zippedStats = zip(historicalPrices.data.items, historicalStats);
    this.zLog.debug(`zipped stats for the past month: ${JSON.stringify(zippedStats, null, 2)}`);

    let epoch = 0;
    for (const [ priceData, stats ] of zippedStats) {
      this.zLog.debug(`[sim epoch: ${0}]: price data ${JSON.stringify(priceData, null, 2)}, stats: ${JSON.stringify(stats, null, 2)}`);
      
      const closing = priceData.c;
      const signal = this.signalGenerator.simulate(closing, stats);
      this.zLog.debug(`generated signal: ${signal}`);

      epoch++;
    }

    const end = new Date();
    const elapsedTimeInMs = end.getTime() - start.getTime();

    return {
      successRate: 0,
      totalTrades: 0,
      portfolioSize: { start: 0, end: 0 },
      percentChange: 0,
      auditStart: subDays(start, 32).toISOString() as ISODateString,
      auditEnd: subDays(start, 1).toISOString() as ISODateString
    };
  }

  async simulateLiveTrades(signal: Signal, stats: StatsEntry) {
    const generatorType = this.opts?.overrideSignalGenerator ? this.opts.overrideSignalGenerator : envLoader[envLoader.SELECTED_SIGNAL_GENERATOR];
    this.signalGenerator = SignalGeneratorRegistry.generators(this.auditProvider, this.tokenStatsProvider)[generatorType];

  }
}