import { addDays, subDays } from 'date-fns';
import lodash from 'lodash';
const { first } = lodash;

import { BaseProcessorProvider } from '@preprocessor/providers/BaseProcessorProvider';

import { calculateEMA } from '@core/utils/Math';
import { TokenStatsSchema, StatsEntry } from '@common/models/TokenStats';
import { TokenPriceProvider } from '@common/providers/TokenPriceProvider';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';
import { AuditSchema, Action } from '@common/models/Audit';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';


export class CalculateEMAProcessor extends BaseProcessorProvider {
  private tokenPriceProvider: TokenPriceProvider;
  private tokenStatsProvider: TokenStatsProvider;

  constructor() { super(CalculateEMAProcessor.name); }

  initInternalProviders(): boolean {
    this.tokenPriceProvider = new TokenPriceProvider(BIRDEYE_API_KEY, 'solana');
    this.tokenStatsProvider = new TokenStatsProvider(this.etcProvider);

    return true;
  }

  async process(): Promise<((AuditSchema<Action, StatsEntry>)['parsedValueType']['action'])> {
    const prevStatsEntry: TokenStatsSchema['parsedValueType'] = await this.tokenStatsProvider.getLatest()
   
    const defaultSInterval: TokenStatsSchema['parsedValueType']['shortTermEMA']['interval'] = 7;
    const defaultLInterval: TokenStatsSchema['parsedValueType']['longTermEMA']['interval'] = 50;

    const { shortTermEMA, longTermEMA  } = prevStatsEntry 
      ? prevStatsEntry
      : { shortTermEMA: { interval: defaultSInterval, value: 0 }, longTermEMA: { interval: defaultLInterval, value: 0 }}
    
    const prevTimeframe = prevStatsEntry ? new Date(prevStatsEntry.timestamp) : subDays(new Date(), 1);
    const currentFrame = addDays(prevTimeframe, 1);

    const ohlcResp = await this.tokenPriceProvider.getOHLC({ address: SOL_TOKEN_ADDRESS, type: '5m', time_from: prevTimeframe, time_to: currentFrame });
    const closing = first(ohlcResp.data.items).c;

    const { key, value } = await this.tokenStatsProvider.insertTokenStatsEntry({
      shortTermEMA: { interval: shortTermEMA.interval, value: calculateEMA(closing, shortTermEMA.value, shortTermEMA.interval) },
      longTermEMA: { interval: longTermEMA.interval, value: calculateEMA(closing, longTermEMA.value, longTermEMA.interval) },
    });

    this.zLog.debug(`finished processing new stats entry for ema for key: ${key}`);
    this.zLog.debug(`current stats entry: ${JSON.stringify(value, null, 2)}, previous stats entry: ${JSON.stringify(prevStatsEntry, null, 2)}`);
    
    return { action: 'calculateEMA', payload: value };
  }
}