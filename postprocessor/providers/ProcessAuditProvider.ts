import { Action, AuditModel } from '@common/models/Audit';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { LogProvider } from '@core/providers/LogProvider';


export class ProcessAuditProvider {
  constructor(
    private auditProvider: AuditProvider,
    private zLog = new LogProvider(ProcessAuditProvider.name)
  ) {}

  async startAuditWatcher<V>(opts: { action: Action }) {
    const prefix: AuditModel<V>['Prefix'] = `audit/${opts.action}`;
    await this.auditProvider.startWatcherForAuditAction({ prefix });
    this.auditProvider.onWatchAuditAction(prefix, async audit => { 
      this.zLog.debug(`deserialized audit: ${audit}`);
    });
  }
}