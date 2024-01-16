import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { AuditModel } from '@common/models/Audit';
import { StatsEntry } from '@common/models/TokenStats';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';


export abstract class BaseProcessorProvider {
  protected etcProvider: ETCDProvider;
  protected zLog: LogProvider;

  private auditProvider: AuditProvider;

  constructor(protected name: string) { this.zLog = new LogProvider(this.name); } 

  abstract initInternalProviders(): boolean;
  abstract process(): Promise<(AuditModel<StatsEntry>['ValueType']['action'])>;
  abstract seed(now: Date): Promise<(AuditModel<StatsEntry>['ValueType']['action'])>;

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
      await this.auditProvider.insertAuditEntry<typeof payload.payload>({ action: payload });
      
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
      await this.auditProvider.insertAuditEntry({ action: payload });

      return true;
    } catch (err) {
      this.zLog.error(`error on processor file: ${err}`);
      throw err;
    }
  }
}