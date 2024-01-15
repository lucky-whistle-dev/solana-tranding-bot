import { subDays } from 'date-fns';
import lodash from 'lodash';
const { first } = lodash;

import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { LogProvider } from '@core/providers/LogProvider';
import { calculateEMA, calculateSlope, calculateStdEMA, calculateZScore } from '@core/utils/Math';
import { convertISOToUnix } from '@core/utils/Utils';
import { ISODateString } from '@core/types/ISODate';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { LongInterval, ShortInterval, StatsEntry, TokenStatsSchema } from '@common/models/TokenStats';


export class HybridTrendSignalProvider extends BaseSignalGeneratorProvider {
  constructor(auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider) { 
    super(auditProvider, tokenStatsProvider, new LogProvider(HybridTrendSignalProvider.name));
  }

  protected async getApplicableStats(): Promise<StatsEntry<ShortInterval, LongInterval>> {
    const now = new Date();

    const start: TokenStatsSchema['formattedKeyType']  = `tokenStats/${subDays(now, 2).toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 1).toISOString() as ISODateString}`;

    const latestFromYDay = await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 });
    return first(latestFromYDay);
  }

  protected async runModel(opts: { price: number, stats: StatsEntry<ShortInterval, LongInterval> }): Promise<Signal> {
    const unixTimeNow = convertISOToUnix(new Date().toISOString() as ISODateString);
    const unixTimePrevious = convertISOToUnix(opts.stats.timestamp);

    const shortTermTrend = calculateSlope(opts.price, opts.stats.shortTerm.ema, unixTimeNow, unixTimePrevious);
    const longTermTrend = calculateSlope(opts.price, opts.stats.longTerm.ema, unixTimeNow, unixTimePrevious);

    const currentShortTermEMA = calculateEMA(opts.price, opts.stats.shortTerm.ema, opts.stats.shortTerm.interval);
    const currentLongTermEMA = calculateEMA(opts.price, opts.stats.longTerm.ema, opts.stats.longTerm.interval);
    const currentShortTermStd = calculateStdEMA(opts.price, currentShortTermEMA, opts.stats.shortTerm.std, opts.stats.shortTerm.interval);
    const currentLongTermStd = calculateStdEMA(opts.price, currentLongTermEMA, opts.stats.longTerm.std, opts.stats.longTerm.interval);

    const shortTermZScore = calculateZScore(opts.price, currentShortTermEMA, currentShortTermStd);
    const longTermZScore = calculateZScore(opts.price, currentLongTermEMA, currentLongTermStd);

    const shortTermThreshold = determineZScoreThreshold(shortTermZScore);
    const longTermThreshold = determineZScoreThreshold(longTermZScore);

    this.zLog.debug(`current zscores: ${JSON.stringify({ shortTerm: shortTermZScore, longTerm: longTermZScore }, null, 2)}`);

    if (longTermTrend >= 0 && shortTermTrend >= 0) {
      if (longTermTrend > shortTermTrend) {
        this.zLog.debug('possible strong upward momentum with long term increasing faster than short term');
        
        if (
          (shortTermThreshold === 'OVERBOUGHT' || shortTermThreshold === '+INSIGNIFICANT') 
          && (longTermThreshold === 'OVERBOUGHT' || longTermThreshold === '+INSIGNIFICANT')
        ) {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }

        if ((shortTermThreshold === 'OVERSOLD' || shortTermThreshold === '-INSIGNIFICANT') && longTermThreshold === 'OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      }
    }

    if (longTermTrend >= 0 && shortTermTrend < 0) {
      if (longTermTrend > Math.abs(shortTermTrend)) {
        this.zLog.debug('possible weak upward momentum with long term increasing faster than short term');
        
        if (shortTermThreshold === 'OVERBOUGHT' && longTermThreshold !== 'OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }

        if (
          (shortTermThreshold === 'OVERSOLD' || shortTermThreshold === '-INSIGNIFICANT')
          && (longTermThreshold === 'OVERSOLD' || longTermThreshold === '-INSIGNIFICANT')
        ) {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }

      }
    }

    if (longTermTrend < 0 && shortTermTrend >= 0) {
      if (Math.abs(longTermTrend) >= shortTermTrend) {
        this.zLog.debug('possible weak downward momentum with long term increasing faster than short term');
        
        if (
          (shortTermThreshold === 'OVERBOUGHT' || shortTermThreshold === '+INSIGNIFICANT')
          && (longTermThreshold === 'OVERBOUGHT' || longTermThreshold === '+INSIGNIFICANT')
        ) {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
      } else {
        this.zLog.debug('possible weak downward momentum with short term increasing faster than long term');

        if (shortTermThreshold === 'OVERSOLD' && (longTermThreshold === 'OVERSOLD' || longTermThreshold === '-INSIGNIFICANT')) {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      }
    }

    if (longTermTrend < 0 && shortTermTrend < 0) {
      this.zLog.debug('possible strong downward momentum');

      if (Math.abs(longTermTrend) >= shortTermTrend) {
        if (shortTermThreshold === 'OVERBOUGHT' && longTermThreshold !== 'OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
  
        if (shortTermThreshold === 'OVERSOLD' && longTermThreshold === 'OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      } else {
        if ((shortTermThreshold === 'OVERBOUGHT' || shortTermThreshold === '+INSIGNIFICANT') && longTermThreshold === 'OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
  
        if (shortTermThreshold === 'OVERSOLD' && longTermThreshold === 'OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      }
    }

    return 'NOOP';
  }
}


const determineZScoreThreshold = (zscore: number): 'OVERBOUGHT' | '+INSIGNIFICANT' | '-INSIGNIFICANT' | 'OVERSOLD' => {
  if (zscore > 1.5) return 'OVERBOUGHT';
  if (zscore > 0) return '+INSIGNIFICANT';
  if (zscore > -1.5) return '-INSIGNIFICANT';
  return 'OVERSOLD';
};