import { subDays, differenceInMilliseconds } from 'date-fns';
import lodash from 'lodash';
const { chunk, first, last } = lodash;

import { BaseProcessorProvider } from '@common/providers/BaseProcessorProvider';

import { 
  calculateEMA, calculateSMA, calculateStdEMA, calculateStdSMA, calculateZScore, periodsForTimeframe, Timeframe 
} from '@core/utils/Math';
import { convertUnixToISO } from '@core/utils/Utils';
import { ISODateString } from '@core/types/ISODate';
import { envLoader } from '@common/EnvLoader';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { AuditModel } from '@common/models/Audit';
import { TokenStatsModel } from '@common/models/TokenStats';
import { TokenSymbol } from '@common/types/token/Token';


export class CalculateStatsProcessor extends BaseProcessorProvider {
  private tokenPriceProvider: TokenPriceProvider;
  private tokenStatsProvider: TokenStatsProvider;

  constructor(opts?: { token: TokenSymbol, timeframe: Timeframe }) { super(CalculateStatsProcessor.name, opts); }

  initInternalProviders(): boolean {
    this.tokenPriceProvider = new TokenPriceProvider(envLoader.BIRDEYE_API_KEY, 'solana');
    this.tokenStatsProvider = new TokenStatsProvider(this.etcProvider);
    
    return true;
  }

  async process(): Promise<(AuditModel<TokenStatsModel['ValueType']>['ValueType']['action'])> {
    const prevStatsEntry = await this.tokenStatsProvider.getLatest({ token: this.opts.token, timeframe: this.opts.timeframe });
    if (! prevStatsEntry) return null;

    const { ema, std, tokenAddress, timeframe, timestamp } = prevStatsEntry;

    const ohlcResp = await this.tokenPriceProvider.getOHLC({ 
      address: tokenAddress,
      type: timeframe,
      time_from: new Date(timestamp),
      time_to: new Date()
    });

    const latestValue = last(ohlcResp.data.items);

    if (differenceInMilliseconds(new Date(convertUnixToISO(latestValue.unixTime)), new Date(prevStatsEntry.timestamp)) <= 0) return null;

    const updatedShortTermEMA = calculateEMA(
      latestValue.c, ema.short.val, 
      { timeframe: this.opts.timeframe, periods: ema.short.interval, interval: 'day' }
    );
    
    const updatedShortTermSTD = calculateStdEMA(
      latestValue.c, ema.short.val, std.short.val,
      { timeframe: this.opts.timeframe, periods: std.short.interval, interval: 'day' }
    );

    const updatedLongTermEMA = calculateEMA(
      latestValue.c, ema.long.val,
      { timeframe: this.opts.timeframe, periods: ema.long.interval, interval: 'day' }
    );

    const updatedLongTermSTD = calculateStdEMA(
      latestValue.c, ema.long.val, std.long.val,
      { timeframe: this.opts.timeframe, periods: std.long.interval, interval: 'day' }
    );
    
    const { key, value } = await this.tokenStatsProvider.insertTokenStatsEntry({
      tokenAddress: prevStatsEntry.tokenAddress, tokenSymbol: prevStatsEntry.tokenSymbol,
      timeframe: prevStatsEntry.timeframe, timestamp: convertUnixToISO(latestValue.unixTime),
      o: latestValue.o, c: latestValue.c, h: latestValue.h, l: latestValue.l, v: latestValue.v,
      ema: { 
        short: { interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, val: updatedShortTermEMA },
        long: { interval: envLoader.SELECTED_LONG_TERM_INTERVAL, val: updatedLongTermEMA }
      },
      std: {
        short: { interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, val: updatedShortTermSTD },
        long: { interval: envLoader.SELECTED_LONG_TERM_INTERVAL, val: updatedLongTermSTD }  
      },
      zscore: { 
        short: { 
          interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, 
          val: calculateZScore(latestValue.c, updatedShortTermEMA, updatedShortTermSTD)
        },
        long: {
          interval: envLoader.SELECTED_LONG_TERM_INTERVAL,
          val: calculateZScore(latestValue.c, updatedLongTermEMA, updatedLongTermSTD)
        }
      }
    });
    
    return { action: 'calculateStats', payload: value };
  }

  async seed(now: Date): Promise<AuditModel<TokenStatsModel['ValueType']>['ValueType']['action']> {
    const startDate = subDays(now, envLoader.SELECTED_LONG_TERM_INTERVAL + 1);
    const startDateString = startDate.toISOString() as ISODateString;
    const endDateString = now.toISOString() as ISODateString;

    const start: TokenStatsModel['KeyType'] = `tokenStats/${this.opts.token}/${this.opts.timeframe}/${startDateString}`;
    const end: TokenStatsModel['KeyType'] = `tokenStats/${this.opts.token}/${this.opts.timeframe}/${endDateString}`;

    const prevStatsEntry = first(await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 }));
    if (prevStatsEntry) return null;

    this.zLog.debug(`start - end for seed data: ${start} - ${end}`);

    const ohlcData = await this.tokenPriceProvider.getOHLC({ 
      address: envLoader.TOKEN_ADDRESS,
      type: envLoader.SELECTED_TIMEFRAME,
      time_from: startDate,
      time_to: now
    });

    let prevValue: TokenStatsModel['ValueType'];
    const [ firstFrame, secondFrame ] = chunk(ohlcData.data.items, ohlcData.data.items.length / 2);
    for (const [ idx, entry ] of Object.entries(secondFrame)) {
      const { shortTermMean, shortTermStd, longTermMean, longTermStd } = await (async () => {
        if (+idx === 0) {
          const initLongClosing = firstFrame.map(item => item.c);
          const periodsForTf = periodsForTimeframe({
            periods: envLoader.SELECTED_SHORT_TERM_INTERVAL, 
            timeframe: envLoader.SELECTED_TIMEFRAME, 
            interval: 'day'
          });

          const initShortClosing = initLongClosing.slice(-periodsForTf);

          return {
            shortTermMean: calculateSMA(initShortClosing), shortTermStd: calculateStdSMA(initShortClosing),
            longTermMean: calculateSMA(initLongClosing), longTermStd: calculateStdSMA(initLongClosing)
          }
        }

        const { ema, std } = prevValue;

        return {
          shortTermMean: calculateEMA(
            entry.c, ema.short.val, { timeframe: this.opts.timeframe, periods: ema.short.interval, interval: 'day' }
          ),
          shortTermStd: calculateStdEMA(
            entry.c, ema.short.val, std.short.val, { timeframe: this.opts.timeframe, periods: std.short.interval, interval: 'day' }
          ),
          longTermMean: calculateEMA(
            entry.c, ema.long.val, { timeframe: this.opts.timeframe, periods: ema.long.interval, interval: 'day' }
          ),
          longTermStd: calculateStdEMA(
            entry.c, ema.long.val, std.long.val, { timeframe: this.opts.timeframe, periods: std.long.interval, interval: 'day' }
          ),
        }
      })();
      
      const { key, value } = await this.tokenStatsProvider.insertTokenStatsEntry({
        tokenSymbol: this.opts.token, tokenAddress: envLoader.TOKEN_ADDRESS,
        o: entry.o, h: entry.h, l: entry.l, c: entry.c, v: entry.v,
        timeframe: entry.type, timestamp: convertUnixToISO(entry.unixTime),
        ema: { 
          short: { interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, val: shortTermMean },
          long: { interval: envLoader.SELECTED_LONG_TERM_INTERVAL, val: longTermMean }
        },
        std: {
          short: { interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, val: shortTermStd },
          long: { interval: envLoader.SELECTED_LONG_TERM_INTERVAL, val: longTermStd }  
        },
        zscore: { 
          short: { 
            interval: envLoader.SELECTED_SHORT_TERM_INTERVAL,
            val: calculateZScore(entry.c, shortTermMean, shortTermStd)
          },
          long: {
            interval: envLoader.SELECTED_LONG_TERM_INTERVAL,
            val: calculateZScore(entry.c, longTermMean, longTermStd)
          }
        }
      });

      this.zLog.debug(`seeded stats entry for frame ${+idx}: ${JSON.stringify(value, null, 2)}`);
      prevValue = value;
    }

    return { action: 'calculateStats', payload: prevValue };
  }
}