import { subMinutes } from 'date-fns';
import lodash from 'lodash';
const { last } = lodash;

import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { LogProvider } from '@core/providers/LogProvider';
import { Timeframe, calculateEMA, calculateSlope, calculateStdEMA, calculateZScore, timeFramesPerUnit } from '@core/utils/Math';
import { convertISOToUnix } from '@core/utils/Utils';
import { ISODateString } from '@core/types/ISODate';
import { TokenSymbol } from '@common/types/token/Token';
import { envLoader } from '@common/EnvLoader';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { TokenStatsModel } from '@common/models/TokenStats';


export class HybridTrendSignalProvider extends BaseSignalGeneratorProvider {
  constructor(
    auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider,
    opts: { token: TokenSymbol, timeframe: Timeframe } = { token: envLoader.TOKEN_SYMBOL, timeframe: envLoader.SELECTED_TIMEFRAME }
  ) { super(auditProvider, tokenStatsProvider, opts, new LogProvider(HybridTrendSignalProvider.name)); }

  protected async getApplicableStats(): Promise<TokenStatsModel['ValueType']> {
    const formatKey = ((curr: Date): TokenStatsModel['KeyType'] => `tokenStats/${this.opts.token}/${this.opts.timeframe}/${curr.toISOString() as ISODateString}`);

    const now = new Date();
    const prevFrame = timeFramesPerUnit[this.opts.timeframe].min;
    this.zLog.debug(`fetching stats from ${timeFramesPerUnit[this.opts.timeframe].min} minutes ago`);
    const stats = await this.tokenStatsProvider.range({ range: { start: formatKey(subMinutes(now, prevFrame)), end: formatKey(now) }});
    
    return last(stats);
  }

  protected async runModel(opts: { price: number, stats: TokenStatsModel['ValueType'] }): Promise<Signal> {
    const unixTimeNow = convertISOToUnix(new Date().toISOString() as ISODateString);
    const unixTimePrevious = convertISOToUnix(opts.stats.timestamp);

    const shortTermTrend = calculateSlope(opts.price, opts.stats.ema.short.val, unixTimeNow, unixTimePrevious);
    const longTermTrend = calculateSlope(opts.price, opts.stats.ema.long.val, unixTimeNow, unixTimePrevious);

    const currentShortTermEMA = calculateEMA(
      opts.price, opts.stats.ema.short.val,
      { periods: opts.stats.ema.short.interval, timeframe: this.opts.timeframe, interval: 'day' }
    );

    const currentLongTermEMA = calculateEMA(
      opts.price, opts.stats.ema.long.val,
      { periods: opts.stats.ema.long.interval, timeframe: this.opts.timeframe, interval: 'day' }
    );

    const currentShortTermStd = calculateStdEMA(
      opts.price, currentShortTermEMA, opts.stats.std.short.val,
      { periods: opts.stats.std.short.interval, timeframe: this.opts.timeframe, interval: 'day' }
    );

    const currentLongTermStd = calculateStdEMA(
      opts.price, currentLongTermEMA, opts.stats.std.long.val, 
      { periods: opts.stats.ema.long.interval, timeframe: this.opts.timeframe, interval: 'day' }
    );

    const shortTermZScore = calculateZScore(opts.price, currentShortTermEMA, currentShortTermStd);
    const longTermZScore = calculateZScore(opts.price, currentLongTermEMA, currentLongTermStd);

    const shortTermThreshold = determineZScoreThreshold(shortTermZScore);
    const longTermThreshold = determineZScoreThreshold(longTermZScore);

    this.zLog.debug(`current zscores: ${JSON.stringify({ shortTerm: shortTermZScore, longTerm: longTermZScore }, null, 2)}`);

    if (longTermTrend >= 0 && shortTermTrend >= 0) {
      this.zLog.debug('increasing growth on upward trend');

      if (longTermTrend > shortTermTrend) {
        this.zLog.debug('possible strong upward momentum with long term increasing faster than short term');
        
        if (
          (shortTermThreshold === '+OVERBOUGHT' || shortTermThreshold === '-OVERBOUGHT') 
          && (longTermThreshold === '+OVERBOUGHT' || longTermThreshold === '-OVERSOLD')
        ) {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }

        if ((shortTermThreshold === '+OVERSOLD' || shortTermThreshold === '-OVERSOLD') && longTermThreshold === '+OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      } else {
        this.zLog.debug('possible slowing upward momentum with long term increasing faster than short term');

        if (shortTermThreshold === '+OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL'
        }

        if (shortTermThreshold === '+OVERSOLD' && (longTermThreshold === '+OVERSOLD' || longTermThreshold === '-OVERSOLD')) {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      }
    }

    if (longTermTrend >= 0 && shortTermTrend < 0) {
      this.zLog.debug('slowing growth on upward trend');

      if (longTermTrend > Math.abs(shortTermTrend)) {
        this.zLog.debug('possible flattening upward momentum with long term increasing faster than short term');
        
        if (shortTermThreshold === '+OVERBOUGHT' && longTermThreshold !== '+OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }

        if ((shortTermThreshold === '+OVERSOLD' || shortTermThreshold === '-OVERSOLD') && longTermThreshold !== '+OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      } else {
        this.zLog.debug('possible weak downward short term momentum with short term increasing faster than long term');

        if (shortTermThreshold === '+OVERBOUGHT' || shortTermThreshold === '-OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
      }
    }

    if (longTermTrend < 0 && shortTermTrend >= 0) {
      this.zLog.debug('slowing decay on downward trend');

      if (Math.abs(longTermTrend) >= shortTermTrend) {
        this.zLog.debug('possible increasing downward momentum with long term increasing faster than short term');
        
        if (longTermThreshold === '+OVERBOUGHT' || longTermThreshold === '-OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
      } else {
        this.zLog.debug('possible weak upward momentum with short term increasing faster than long term');

        if (shortTermThreshold === '+OVERSOLD' && (longTermThreshold === '+OVERSOLD' || longTermThreshold === '-OVERSOLD')) {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      }
    }

    if (longTermTrend < 0 && shortTermTrend < 0) {
      this.zLog.debug('increasing decay on downard trend');

      if (Math.abs(longTermTrend) >= shortTermTrend) {
        this.zLog.debug('possible slowing downtrend with long term increasing faster than short term');

        if (shortTermThreshold === '+OVERBOUGHT' && longTermThreshold !== '+OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }

        if (shortTermThreshold === '+OVERSOLD') {
          this.zLog.debug(`deviation from mean shows possibly oversold, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'BUY';
        }
      } else {
        this.zLog.debug('possible accelerating downtrend with short term increasing faster than long term');

        if (longTermThreshold === '+OVERBOUGHT') {
          this.zLog.debug(`deviation from mean shows possibly overbought, with short term zScore: ${shortTermZScore}, and long term zScore: ${longTermZScore}`);
          return 'SELL';
        }
      }
    }

    return 'NOOP';
  }
}


const determineZScoreThreshold = (zscore: number): '+OVERBOUGHT' | '-OVERBOUGHT' | 'NEUTRAL' | '-OVERSOLD' | '+OVERSOLD' => {
  if (zscore > 1) return '+OVERBOUGHT';
  if (zscore > 0.5) return '-OVERBOUGHT';
  if (zscore > -0.5) return 'NEUTRAL';
  if (zscore > -1) return '-OVERSOLD';
  
  return '+OVERSOLD';
};