import { LogProvider } from '@core/providers/LogProvider';

import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { StatsEntry } from '@common/models/TokenStats';


export abstract class BaseSignalGeneratorProvider {
  constructor(protected auditProvider: AuditProvider, protected tokenStatsProvider: TokenStatsProvider, protected zLog: LogProvider) {}

  async start(price: number): Promise<{ signal: Signal, stats: StatsEntry }> {
    const stats = await this.getApplicableStats();
    if (! stats) return { signal: 'NOOP', stats: null };
    
    this.zLog.debug(`running model for current price with stats: ${JSON.stringify(stats, null, 2)}`);
    const signal = await this.runModel({ price, stats });
    
    return { signal, stats };
  }

  async simulate(price: number, stats: StatsEntry): Promise<{ signal: Signal, stats: StatsEntry }> {
    this.zLog.debug(`simulating signal generation on historical data: ${JSON.stringify(stats, null, 2)}`);
    
    const signal = await this.runModel({ price, stats });
    return { signal, stats };
  }

  protected abstract getApplicableStats(): Promise<StatsEntry>;
  protected abstract runModel(opts: { price: number, stats: StatsEntry }): Promise<Signal>;
}