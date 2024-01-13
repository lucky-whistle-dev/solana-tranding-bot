import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { GenerateSignalHelper, Signal } from '@trader/types/Trader';
import { LongInterval, ShortInterval, StatsEntry } from '@common/models/TokenStats';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { calculateSlope } from '@core/utils/Math';


export class HybridTrendModelGenerator {
  constructor(
    private auditProvider: AuditProvider, 
    private tokenStatsProvider: TokenStatsProvider,
    private zLog: LogProvider
  ) {}

  private async getLatestStats<SHRT extends ShortInterval, LONG extends LongInterval>(): Promise<StatsEntry<SHRT, LONG>> {
    return null;
  }

  private buildModel<SHRT extends ShortInterval, LONG extends LongInterval>(
    buildOpts: {
      price: number,
      stats: StatsEntry<SHRT, LONG>
    }
  ): GenerateSignalHelper<SHRT, LONG>  {
    /*
    const signalHelper = (): Signal => {
      const shortTermTrend = calculateSlope(stats., buildOpts.stats.shortTermEMA.value, shortTermN, prevShortTermN);
      const longTermTrend = calculateSlope(longTermEMA, prevLongTermEMA, longTermN, prevLongTermN);

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
    */

    return null;
  } 
}