import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { calculateEMA, calculateSlope } from '@common/utils/ModelUtils';
import { HistoricalTokenStatsSchema } from '@common/models/HistoricalTokenStats';


export class ExecuteTradeProvider {
  private zLog: LogProvider = new LogProvider(ExecuteTradeProvider.name);
  
  constructor(private etcdProvider: ETCDProvider, private tokenSwapProvider: TokenSwapProvider) {}

  async run(price: number): Promise<any> {  
    const { prevShortTermEMA, prevLongTermEMA, prevShortTermN, prevLongTermN } = await this.getPreviousEmas();

    const shortTermEMA = calculateEMA(price, prevShortTermEMA, 7);
    const longTermEMA = calculateEMA(price, prevLongTermEMA, 50);

    const shortTermN = prevShortTermN + 1;
    const longTermN = prevLongTermN + 1;

    await this.updateEmas(shortTermEMA, longTermEMA, shortTermN, longTermN);

    const shortTermTrend = calculateSlope(shortTermEMA, prevShortTermEMA, shortTermN, prevShortTermN);
    const longTermTrend = calculateSlope(longTermEMA, prevLongTermEMA, longTermN, prevLongTermN);

    this.zLog.info(`short term trend: ${shortTermTrend}, long term trend: ${longTermTrend}, timeframes: ${shortTermN}`);

    if (longTermTrend >= 0 && shortTermTrend >= 0) {
      if (shortTermEMA < longTermEMA && price > shortTermTrend && price > longTermEMA) {
        this.zLog.debug('possible strong upward momentum with long term increasing faster than short term');
      }
    }

    if (longTermTrend >= 0 && shortTermTrend < 0) {
      if (Math.abs(shortTermTrend) < longTermTrend) {
        this.zLog.debug('possible weak upward momentum with long term increasing faster than short term');
      }
    }

    if (longTermTrend < 0 && shortTermTrend >= 0) {
      if (Math.abs(longTermTrend) > shortTermTrend) {
        this.zLog.debug('possible weak downward momentum with long term increasing faster than short term');
      }
    }

    if (longTermTrend < 0 && shortTermTrend < 0) {
      this.zLog.debug('possible strong downward momentum');
    }

    return null;
  }

  private async getPreviousEmas(): Promise<PreviousEMAsResponse> { 
    const emaPrefix = 'ema';
    const sTermEMAResp: await this.etcdProvider.get<HistoricalTokenStatsSchema['formattedKeyType'], HistoricalTokenStatsSchema['parsedValueType'], HistoricalTokenStatsSchema['prefix']>();
    const lTermEMAResp: JSON.parse(await this.etcdProvider.get(EMA_KEYS.ema50, emaPrefix));

    return { 
      prevShortTermEMA: 0,
      prevLongTermEMA: 0,
      prevShortTermN: sTermEMAResp?.n ?? 0,
      prevLongTermN: lTermEMAResp?.n ?? 0
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