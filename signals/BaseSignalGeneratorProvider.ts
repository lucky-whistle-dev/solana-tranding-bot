import { LogProvider } from '@core/providers/LogProvider';

import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { LongInterval, ShortInterval, StatsEntry } from '@common/models/TokenStats';


export abstract class BaseSignalGeneratorProvider {
  constructor(protected auditProvider: AuditProvider, protected tokenStatsProvider: TokenStatsProvider, protected zLog: LogProvider) {}

  async start(price: number): Promise<Signal> {
    const stats = await this.getApplicableStats();
    if (! stats) return 'NOOP';
    
    this.zLog.debug(`running model for current price with stats: ${JSON.stringify(stats, null, 2)}`);
    return this.runModel({ price, stats });
  }

  protected abstract getApplicableStats(): Promise<StatsEntry<ShortInterval, LongInterval>>;
  protected abstract runModel(opts: { price: number, stats: StatsEntry<ShortInterval, LongInterval>}): Promise<Signal>;
}