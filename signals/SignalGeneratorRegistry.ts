import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { HybridTrendSignalProvider } from '@signals/generators/HybridTrendSignalGenerator';


type SelectedSignal = 'hybridtrend';
type SignalGeneratorMap = { [model in SelectedSignal]: BaseSignalGeneratorProvider };

export class SignalGeneratorRegistry {
  static generators = (auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider): SignalGeneratorMap => ({
    hybridtrend: new HybridTrendSignalProvider(auditProvider, tokenStatsProvider)
  });
}