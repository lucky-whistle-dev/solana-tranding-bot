import { addDays, subDays, subMinutes } from 'date-fns';
import lodash from 'lodash';
const { first, last } = lodash;

import { BaseProcessorProvider } from '@preprocessor/providers/BaseProcessorProvider';

import { ISODateString } from '@core/types/ISODate';
import { calculateEMA, calculateSMA, calculateStdEMA, calculateStdSMA, calculateZScore } from '@core/utils/Math';
import { envLoader } from '@common/EnvLoader';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { TokenStatsSchema, StatsEntry } from '@common/models/TokenStats';
import { AuditSchema, Action } from '@common/models/Audit';


const FRAME_SIZE_IN_MIN = 5;
const MINUTES_IN_DAY = 24 * 60;
const FRAMES_IN_DAY_IN_MIN = MINUTES_IN_DAY / FRAME_SIZE_IN_MIN;

export class CalculateStatsProcessor extends BaseProcessorProvider {
  private tokenPriceProvider: TokenPriceProvider;
  private tokenStatsProvider: TokenStatsProvider;

  constructor() { super(CalculateStatsProcessor.name); }

  initInternalProviders(): boolean {
    this.tokenPriceProvider = new TokenPriceProvider(envLoader.BIRDEYE_API_KEY, 'solana');
    this.tokenStatsProvider = new TokenStatsProvider(this.etcProvider);
    return true;
  }

  async process(): Promise<((AuditSchema<Action, StatsEntry>)['parsedValueType']['action'])> {
    const now = new Date();
    const start: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 2).toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 1).toISOString() as ISODateString}`;

    const prevStatsEntry: TokenStatsSchema['parsedValueType'] = first(await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 }));
    const { shortTerm, longTerm, timestamp } = prevStatsEntry;
    
    const prevTimeframe = prevStatsEntry ? new Date(timestamp) : subDays(new Date(), 1);
    const currentFrame = addDays(prevTimeframe, 1);

    const ohlcResp = await this.tokenPriceProvider.getOHLC({
      address: envLoader.TOKEN_ADDRESS,
      type: envLoader.SELECTED_TIMEFRAME, 
      time_from: prevTimeframe,
      time_to: currentFrame
    });

    this.zLog.debug(`latest ohlc historical entry: ${last(ohlcResp.data.items)}`);
    const latestClosing = last(ohlcResp.data.items).c;

    const updatedShortTermEMA = calculateEMA(latestClosing, shortTerm.ema, shortTerm.interval);
    const updatedLongTermEMA = calculateEMA(latestClosing, longTerm.ema, longTerm.interval);
    const updatedShortTermStd = calculateStdEMA(latestClosing, shortTerm.ema, shortTerm.std, shortTerm.interval);
    const updatedLongTermStd = calculateStdEMA(latestClosing, longTerm.ema, longTerm.std, longTerm.interval);

    const { key, value } = await this.tokenStatsProvider.insertTokenStatsEntry({
      shortTerm: { 
        interval: shortTerm.interval, 
        ema: updatedShortTermEMA,
        std: updatedShortTermStd,
        zscore: calculateZScore(latestClosing, updatedShortTermEMA, updatedShortTermStd)
      },
      longTerm: { 
        interval: longTerm.interval, 
        ema: updatedLongTermEMA,
        std: updatedLongTermStd,
        zscore: calculateZScore(latestClosing, updatedLongTermEMA, updatedLongTermStd)
      },
    });
    
    return { action: 'calculateStats', payload: value };
  }

  async seed(now: Date): Promise<(AuditSchema<Action, StatsEntry>)['parsedValueType']['action']> {
    const start: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 1).toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 2).toISOString() as ISODateString}`;

    const prevStatsEntry: TokenStatsSchema['parsedValueType'] = first(await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 }));
    if (prevStatsEntry) return null;

    let seededEntry: TokenStatsSchema['parsedValueType']
    for (const [ frame, _ ] of Object.entries(Array(FRAMES_IN_DAY_IN_MIN).fill(0))) {
      const currFrameSize = MINUTES_IN_DAY - (FRAME_SIZE_IN_MIN * +frame);
      const frameAgo = subMinutes(now, currFrameSize);

      const sOhlcData = await this.tokenPriceProvider.getOHLC({ 
        address: envLoader.TOKEN_ADDRESS,
        type: envLoader.SELECTED_TIMEFRAME,
        time_from: subDays(frameAgo, envLoader.SELECTED_SHORT_TERM_INTERVAL),
        time_to: frameAgo 
      });
      
      const lOhlcData = await this.tokenPriceProvider.getOHLC({ 
        address: envLoader.TOKEN_ADDRESS,
        type: envLoader.SELECTED_TIMEFRAME,
        time_from: subDays(frameAgo, envLoader.SELECTED_LONG_TERM_INTERVAL),
        time_to: frameAgo
      });

      const sClosingAscending = sOhlcData.data.items.map(item => item.c);
      const lClosingAscending = lOhlcData.data.items.map(item => item.c);

      const shortTermMean = calculateSMA(sClosingAscending);
      const shortTermStd = calculateStdSMA(sClosingAscending);
      const longTermMean = calculateSMA(lClosingAscending);
      const longTermStd = calculateStdSMA(lClosingAscending);

      seededEntry = {
        shortTerm: { 
          interval: envLoader.SELECTED_SHORT_TERM_INTERVAL, 
          ema: shortTermMean,
          std: shortTermStd,
          zscore: calculateZScore(last(sClosingAscending), shortTermMean, shortTermStd)
        },
        longTerm: { 
          interval: envLoader.SELECTED_LONG_TERM_INTERVAL,
          ema: longTermMean,
          std: longTermStd,
          zscore: calculateZScore(last(lClosingAscending), longTermMean, longTermStd)
        },
        timestamp: frameAgo.toISOString() as ISODateString
      };
  
      this.zLog.debug(`seeded stats entry for frame ${frame}: ${JSON.stringify(seededEntry, null, 2)}`);
      await this.tokenStatsProvider.insertTokenStatsEntry(seededEntry);
    }

    return { action: 'calculateStats', payload: seededEntry };
  }
}