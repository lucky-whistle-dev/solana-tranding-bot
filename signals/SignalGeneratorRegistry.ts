import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { HybridTrendSignalProvider } from '@signals/generators/HybridTrendSignalGenerator';


type SelectedModel = 'hybridtrend';

export class SignalGeneratorRegistry {
  static generators = (
    auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider
  ): { [model in SelectedModel]: BaseSignalGeneratorProvider } => ({
    hybridtrend: new HybridTrendSignalProvider(auditProvider, tokenStatsProvider)
  });
}