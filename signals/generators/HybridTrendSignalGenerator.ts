import { subDays } from 'date-fns';
import lodash from 'lodash';
const { first } = lodash;

import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { LogProvider } from '@core/providers/LogProvider';
import { calculateEMA, calculateSlope } from '@core/utils/Math';
import { convertISOToUnix } from '@core/utils/Utils';
import { ISODateString } from '@core/types/ISODate';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { LongInterval, ShortInterval, StatsEntry, TokenStatsSchema } from '@common/models/TokenStats';


export class HybridTrendSignalProvider extends BaseSignalGeneratorProvider {
  constructor(
    auditProvider: AuditProvider, 
    tokenStatsProvider: TokenStatsProvider,
    zLog: LogProvider = new LogProvider(HybridTrendSignalProvider.name)
  ) { super(auditProvider, tokenStatsProvider, zLog); }

  protected async getApplicableStats(): Promise<StatsEntry<ShortInterval, LongInterval>> {
    const now = new Date();

    const dayAgo = subDays(now, 1);
    const twoDaysAgo = subDays(now, 2);

    const start: TokenStatsSchema['formattedKeyType'] = `tokenStats/${dayAgo.toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType']  = `tokenStats/${twoDaysAgo.toISOString() as ISODateString}`;

    const latestFromYDay = await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 });
    return first(latestFromYDay);
  }

  protected async runModel(opts: { price: number, stats: StatsEntry<ShortInterval, LongInterval> }): Promise<Signal> {
    const unixTimeNow = convertISOToUnix(new Date().toISOString() as ISODateString);
    const unixTimePrevious = convertISOToUnix(opts.stats.timestamp);

    const shortTermTrend = calculateSlope(opts.price, opts.stats.shortTermEMA.value, unixTimeNow, unixTimePrevious);
    const longTermTrend = calculateSlope(opts.price, opts.stats.longTermEMA.value, unixTimeNow, unixTimePrevious);

    const currentShortTermEMA = calculateEMA(opts.price, opts.stats.shortTermEMA.value, opts.stats.shortTermEMA.interval);
    const currentLongTermEMA = calculateEMA(opts.price, opts.stats.longTermEMA.value, opts.stats.longTermEMA.interval);

    if (longTermTrend >= 0 && shortTermTrend >= 0) {
      if (longTermTrend > shortTermTrend && opts.price > currentShortTermEMA && opts.price > currentLongTermEMA) {
        this.zLog.debug('possible strong upward momentum with long term increasing faster than short term');
        return 'SELL';
      }
    }

    if (longTermTrend >= 0 && shortTermTrend < 0) {
      if (longTermTrend > Math.abs(shortTermTrend)) {
        this.zLog.debug('possible weak upward momentum with long term increasing faster than short term');
        if (opts.price < currentShortTermEMA && currentShortTermEMA > currentShortTermEMA) return 'BUY';
      }
    }

    if (longTermTrend < 0 && shortTermTrend >= 0) {
      if (Math.abs(longTermTrend) > shortTermTrend) {
        this.zLog.debug('possible weak downward momentum with long term increasing faster than short term');
        if (opts.price > currentShortTermEMA) return 'SELL';
      }
    }

    if (longTermTrend < 0 && shortTermTrend < 0) {
      this.zLog.debug('possible strong downward momentum');
      if (opts.price > currentShortTermEMA && opts.price > currentLongTermEMA) return 'SELL';
    }

    return 'NOOP';
  }
}