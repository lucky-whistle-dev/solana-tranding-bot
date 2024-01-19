import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { AuditModel } from '@common/models/Audit';
import { TokenStatsModel } from '@common/models/TokenStats';
import { envLoader } from '@common/EnvLoader';
import { TokenSymbol } from '@common/types/token/Token';
import { Timeframe } from '@core/utils/Math';


export abstract class BaseProcessorProvider {
  protected etcProvider: ETCDProvider;
  protected zLog: LogProvider;

  private auditProvider: AuditProvider;

  constructor(
    protected name: string, 
    protected opts: { token: TokenSymbol, timeframe: Timeframe } = { token: envLoader.TOKEN_SYMBOL, timeframe: envLoader.SELECTED_TIMEFRAME }
  ) { 
    this.zLog = new LogProvider(this.name); 
  } 

  abstract initInternalProviders(): boolean;
  abstract process(): Promise<(AuditModel<TokenStatsModel['ValueType']>['ValueType']['action'])>;
  abstract seed(now: Date): Promise<(AuditModel<TokenStatsModel['ValueType']>['ValueType']['action'])>;

  private init() {
    this.etcProvider = new ETCDProvider();
    this.auditProvider = new AuditProvider(this.etcProvider);
    this.initInternalProviders();
  }

  async onStartup(): Promise<boolean> {
    try {
      const now = new Date();
      this.zLog.debug(`initializing and running processor for ${this.name}`)
      
      this.init();
      const payload = await this.seed(now);
      if (payload) await this.auditProvider.insertAuditEntry({ action: payload });
      
      return true;
    } catch (err) {
      this.zLog.error(`error on processor file: ${err}`);
      throw err;
    }
  }

  async run(): Promise<boolean> {
    try {
      this.zLog.debug(`initializing and running processor for ${this.name}`)
      
      this.init();
      const payload = await this.process();
      if (payload) await this.auditProvider.insertAuditEntry({ action: payload });

      return true;
    } catch (err) {
      this.zLog.error(`error on processor file: ${err}`);
      throw err;
    }
  }
}