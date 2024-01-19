import { LogProvider } from '@core/providers/LogProvider';
import { Timeframe } from '@core/utils/Math';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { TokenStatsModel } from '@common/models/TokenStats';
import { TokenSymbol } from '@common/types/token/Token';


export abstract class BaseSignalGeneratorProvider {
  constructor(
    protected auditProvider: AuditProvider,
    protected tokenStatsProvider: TokenStatsProvider,
    protected opts: { token: TokenSymbol, timeframe: Timeframe },
    protected zLog: LogProvider
  ) {}

  async start(price: number): Promise<{ signal: Signal, stats: TokenStatsModel['ValueType'] }> {
    const stats = await this.getApplicableStats();
    if (! stats) return { signal: 'NOOP', stats: null };
    
    this.zLog.debug(`running model for current price with stats: ${JSON.stringify(stats, null, 2)}`);
    const signal = await this.runModel({ price, stats });
    
    return { signal, stats };
  }

  async simulate(price: number, stats: TokenStatsModel['ValueType']): Promise<{ signal: Signal, stats: TokenStatsModel['ValueType'] }> {
    this.zLog.debug(`simulating signal generation on historical data: ${JSON.stringify(stats, null, 2)}`);
    
    const signal = await this.runModel({ price, stats });
    return { signal, stats };
  }

  protected abstract getApplicableStats(): Promise<TokenStatsModel['ValueType']>;
  protected abstract runModel(opts: { price: number, stats: TokenStatsModel['ValueType'] }): Promise<Signal>;
}