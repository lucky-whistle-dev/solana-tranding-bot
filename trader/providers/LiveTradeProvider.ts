import { AuditProvider } from "@common/providers/etcd/AuditProvider";
import { TokenStatsProvider } from "@common/providers/etcd/TokenStatsProvider";
import { TokenSwapProvider } from "@common/providers/token/TokenSwapProvider";
import { LogProvider } from "@core/providers/LogProvider";



export class LiveTradeProvider {
  constructor(
    private auditProvider: AuditProvider,
    private tokenStatsProvider: TokenStatsProvider,
    private tokenSwapProvider: TokenSwapProvider,
    private zLog: LogProvider = new LogProvider(LiveTradeProvider.name)
  ) {}

  
}