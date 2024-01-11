import { ETCDProvider } from '@core/providers/EtcdProvider';
import { TokenSwapProvider } from '@solt/providers/token/TokenSwapProvider';
import { ExecutionResponse, KEY_PREFIX, EMA_KEYS, EMAEntry } from '@solt/types/Model';
import { calculateEMA, calculateSlope } from '@solt/utils/ModelUtils';


export class ExecuteTradeProvider {
  constructor(private etcdProvider: ETCDProvider, private tokenSwapProvider: TokenSwapProvider) {}

  async execution(price: number): Promise<ExecutionResponse> {  
    const { prevShortTermEMA, prevLongTermEMA, prevShortTermN, prevLongTermN } = await this.getPreviousEmas();

    const shortTermEMA = calculateEMA(price, prevShortTermEMA, prevShortTermN);
    const longTermEMA = calculateEMA(price, prevLongTermEMA, prevLongTermN);

    const shortTermN = prevShortTermN + 1;
    const longTermN = prevLongTermN + 1;

    await this.updateEmas(shortTermEMA, longTermEMA, shortTermN, longTermN);

    const shortTermTrend = calculateSlope(shortTermEMA, prevShortTermEMA, shortTermN, prevShortTermN);
    const longTermTrend = calculateSlope(longTermEMA, prevLongTermEMA, longTermN, prevLongTermN);


    if (longTermTrend > 0 && shortTermTrend > 0) {

    }

    if (longTermTrend > 0 && shortTermTrend < 0) {

    }

    if (longTermTrend < 0 && shortTermTrend > 0) {

    }

    if (longTermTrend < 0 && shortTermTrend < 0) {

    }

    return null;
  }

  private async getPreviousEmas(): Promise<PreviousEMAsResponse> { 
    const emaPrefix: KEY_PREFIX = 'ema';
    const sTermEMAResp: EMAEntry = JSON.parse(await this.etcdProvider.get(EMA_KEYS.ema7, emaPrefix));
    const lTermEMAResp: EMAEntry = JSON.parse(await this.etcdProvider.get(EMA_KEYS.ema50, emaPrefix));

    return { 
      prevShortTermEMA: sTermEMAResp.ema,
      prevLongTermEMA: lTermEMAResp.ema,
      prevShortTermN: sTermEMAResp.n,
      prevLongTermN: lTermEMAResp.n 
    }
  }

  private async updateEmas(shortTermEMA: number, longTermEMA: number, shortTermN: number, longTermN: number): Promise<boolean> {
    const emaPrefix: KEY_PREFIX = 'ema';

    const shortTermEntry: EMAEntry = { ema: shortTermEMA, n: shortTermN };
    const longTermEntry: EMAEntry = { ema: longTermEMA, n: longTermN };
    
    await this.etcdProvider.put(EMA_KEYS.ema7, JSON.stringify(shortTermEntry), emaPrefix);
    await this.etcdProvider.put(EMA_KEYS.ema50, JSON.stringify(longTermEntry), emaPrefix);

    return true;
  }
}


interface PreviousEMAsResponse { 
  prevShortTermEMA: number;
  prevLongTermEMA: number;
  prevShortTermN: number;
  prevLongTermN: number;
}