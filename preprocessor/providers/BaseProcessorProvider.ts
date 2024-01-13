import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { Action, AuditSchema } from '@common/models/Audit';
import { StatsEntry } from '@common/models/TokenStats';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';


export abstract class BaseProcessorProvider {
  protected etcProvider: ETCDProvider;
  protected zLog: LogProvider;

  private auditProvider: AuditProvider;

  constructor(protected name: string) { this.zLog = new LogProvider(this.name); } 

  abstract initInternalProviders(): boolean;
  abstract process(): Promise<((AuditSchema<Action, StatsEntry>)['parsedValueType']['action'])>;

  private init() {
    this.etcProvider = new ETCDProvider();
    this.auditProvider = new AuditProvider(this.etcProvider);
  }

  async run(): Promise<boolean> {
    try {
      this.zLog.debug(`initializing and running processor for ${this.name}`)
      
      this.init();
      this.initInternalProviders();

      const payload = await this.process();
      
      this.zLog.debug(`payload for audit action on ${this.name}: ${JSON.stringify(payload, null, 2)}`);
      await this.auditProvider.insertAuditEntry({ action: payload });
      
      return true;
    } catch (err) {
      this.zLog.error(`error on processor file: ${err}`);
      throw err;
    }
  }
}