import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { SignalGenerator } from '@common/types/Signal';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { HybridTrendSignalProvider } from '@signals/generators/HybridTrendSignalGenerator';

type SignalGeneratorMap = { [model in SignalGenerator]: BaseSignalGeneratorProvider };

export class SignalGeneratorRegistry {
  static generators = (auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider): SignalGeneratorMap => ({
    hybridtrend: new HybridTrendSignalProvider(auditProvider, tokenStatsProvider)
  });
}