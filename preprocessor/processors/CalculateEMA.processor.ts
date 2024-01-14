import { addDays, subDays, subMinutes } from 'date-fns';
import lodash from 'lodash';
const { first } = lodash;

import { BaseProcessorProvider } from '@preprocessor/providers/BaseProcessorProvider';

import { ISODateString } from '@core/types/ISODate';
import { calculateEMA, calculateSMA } from '@core/utils/Math';
import { envLoader } from '@common/EnvLoader';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { TokenStatsSchema, StatsEntry } from '@common/models/TokenStats';
import { AuditSchema, Action } from '@common/models/Audit';
import { SOL_TOKEN_ADDRESS } from '@config/Token';


const DEFAULT_S_INTERVAL: TokenStatsSchema['parsedValueType']['shortTermEMA']['interval'] = 7;
const DEFAULT_L_INTERVAL: TokenStatsSchema['parsedValueType']['longTermEMA']['interval'] = 50;

const FRAME_SIZE_IN_MIN = 5;
const MINUTES_IN_DAY = 24 * 60;
const FRAMES_IN_DAY_IN_MIN = MINUTES_IN_DAY / FRAME_SIZE_IN_MIN;

export class CalculateEMAProcessor extends BaseProcessorProvider {
  private tokenPriceProvider: TokenPriceProvider;
  private tokenStatsProvider: TokenStatsProvider;

  constructor() { super(CalculateEMAProcessor.name); }

  initInternalProviders(): boolean {
    this.tokenPriceProvider = new TokenPriceProvider(envLoader.BIRDEYE_API_KEY, 'solana');
    this.tokenStatsProvider = new TokenStatsProvider(this.etcProvider);

    return true;
  }

  async process(): Promise<((AuditSchema<Action, StatsEntry>)['parsedValueType']['action'])> {
    const now = new Date();

    const start: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 1).toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 2).toISOString() as ISODateString}`;

    const prevStatsEntry: TokenStatsSchema['parsedValueType'] = first(await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 }));

    const { shortTermEMA, longTermEMA, timestamp } = prevStatsEntry;
    
    const prevTimeframe = prevStatsEntry ? new Date(timestamp) : subDays(new Date(), 1);
    const currentFrame = addDays(prevTimeframe, 1);

    const ohlcResp = await this.tokenPriceProvider.getOHLC({ address: SOL_TOKEN_ADDRESS, type: '5m', time_from: prevTimeframe, time_to: currentFrame });
    const closing = first(ohlcResp.data.items).c;

    const { key, value } = await this.tokenStatsProvider.insertTokenStatsEntry({
      shortTermEMA: { interval: shortTermEMA.interval, value: calculateEMA(closing, shortTermEMA.value, shortTermEMA.interval) },
      longTermEMA: { interval: longTermEMA.interval, value: calculateEMA(closing, longTermEMA.value, longTermEMA.interval) },
    });

    // this.zLog.debug(`finished processing new stats entry for ema for key: ${key}`);
    // this.zLog.debug(`current stats entry: ${JSON.stringify(value, null, 2)}, previous stats entry: ${JSON.stringify(prevStatsEntry, null, 2)}`);
    
    return { action: 'calculateEMA', payload: value };
  }

  async seed(now: Date): Promise<(AuditSchema<Action, StatsEntry>)['parsedValueType']['action']> {
    const start: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 1).toISOString() as ISODateString}`;
    const end: TokenStatsSchema['formattedKeyType'] = `tokenStats/${subDays(now, 2).toISOString() as ISODateString}`;

    const prevStatsEntry: TokenStatsSchema['parsedValueType'][] = await this.tokenStatsProvider.range({ range: { start, end }, limit: 1 });
    if (prevStatsEntry.length) return null;

    let seededEntry: TokenStatsSchema['parsedValueType']
    for (const [ frame, _ ] of Object.entries(Array(FRAMES_IN_DAY_IN_MIN).fill(0))) {
      const currFrameSize = MINUTES_IN_DAY - (FRAME_SIZE_IN_MIN * +frame);

      const frameAgo = subMinutes(now, currFrameSize);
      const sTimeTo = subDays(frameAgo, DEFAULT_S_INTERVAL);
      const lTimeTo = subDays(frameAgo, DEFAULT_L_INTERVAL);

      const sPriceData = await this.tokenPriceProvider.getOHLC({ address: SOL_TOKEN_ADDRESS, type: '5m', time_from: sTimeTo, time_to: frameAgo });
      const lPriceData = await this.tokenPriceProvider.getOHLC({ address: SOL_TOKEN_ADDRESS, type: '5m', time_from: lTimeTo, time_to: frameAgo });

      seededEntry = {
        shortTermEMA: { value: calculateSMA(sPriceData.data.items.map(item => item.c)), interval: DEFAULT_S_INTERVAL },
        longTermEMA: { value: calculateSMA(lPriceData.data.items.map(item => item.c)), interval: DEFAULT_L_INTERVAL },
        timestamp: frameAgo.toISOString() as ISODateString
      };
  
      this.zLog.debug(`seeded stats entry for frame ${frame}: ${JSON.stringify(seededEntry, null, 2)}`);
      await this.tokenStatsProvider.insertTokenStatsEntry(seededEntry);
    }

    return { action: 'calculateEMA', payload: seededEntry };
  }
}