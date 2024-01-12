import { addDays, subDays } from 'date-fns';
import lodash from 'lodash';
const { first } = lodash;

import { BaseProcessorProvider } from '@preprocessor/providers/BaseProcessorProvider';

import { calculateEMA } from '@core/utils/Math';
import { HistoricalTokenStatsSchema } from '@common/models/HistoricalTokenStats';
import { TokenPriceProvider } from '@common/providers/TokenPriceProvider';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';
import { GetAllResponse } from '@core/types/Etcd';
import { ISODateString } from '@core/types/ISODate';


export class CalculateEMAProcessor extends BaseProcessorProvider {
  private tokenPriceProvider: TokenPriceProvider;

  constructor() { 
    super(CalculateEMAProcessor.name);
    this.tokenPriceProvider = new TokenPriceProvider(BIRDEYE_API_KEY, 'solana');
  }

  withModel() {

  }

  async process(): Promise<boolean> {
    const resp: GetAllResponse<HistoricalTokenStatsSchema['formattedKeyType'], HistoricalTokenStatsSchema['parsedValueType'], HistoricalTokenStatsSchema['prefix']> = 
      await this.etcProvider.getAll({ prefix: 'histTokenStats', sort: { on: 'Key', direction: 'Descend' }, limit: 1 });

    this.zLog.debug(`get all response: ${JSON.stringify(resp, null, 2)}`);

    const prevStatsEntry: HistoricalTokenStatsSchema['parsedValueType'] = resp[first(Object.keys(resp))];
    const sInterval: HistoricalTokenStatsSchema['parsedValueType']['shortTermEMA']['interval'] = 7;
    const lInterval: HistoricalTokenStatsSchema['parsedValueType']['longTermEMA']['interval'] = 50;

    const { shortTermEMA, longTermEMA  } = prevStatsEntry 
      ? prevStatsEntry
      : { shortTermEMA: { interval: sInterval, value: 0 }, longTermEMA: { interval: lInterval, value: 0 }}
    
    const prevTimeframe = prevStatsEntry ? new Date(prevStatsEntry.timestamp) : subDays(new Date(), 1);
    const currentFrame = addDays(prevTimeframe, 1);

    const ohlcResp = await this.tokenPriceProvider.getOHLC({ address: SOL_TOKEN_ADDRESS, type: '5m', time_from: prevTimeframe, time_to: currentFrame });
    const closing = first(ohlcResp.data.items).c;
    
    const currShortTermEMA = calculateEMA(closing, shortTermEMA.value, shortTermEMA.interval);
    const currLongTermEMA = calculateEMA(closing, longTermEMA.value, longTermEMA.interval);

    const currStatsEntry: HistoricalTokenStatsSchema['parsedValueType'] = {
      shortTermEMA: { interval: shortTermEMA.interval, value: currShortTermEMA },
      longTermEMA: { interval: longTermEMA.interval, value: currLongTermEMA },
      timestamp: currentFrame.toISOString() as ISODateString
    };

    const newKey: HistoricalTokenStatsSchema['formattedKeyType'] = `histTokenStats/${currStatsEntry.timestamp}`;
    await this.etcProvider.put<HistoricalTokenStatsSchema['formattedKeyType'], HistoricalTokenStatsSchema['parsedValueType']>(newKey, currStatsEntry);

    this.zLog.debug(`finished processing new stats entry for ema for key: ${newKey}`);
    this.zLog.debug(`current stats entry: ${JSON.stringify(currStatsEntry, null, 2)}, previous stats entry: ${JSON.stringify(prevStatsEntry, null, 2)}`);
    
    return true;
  }
}