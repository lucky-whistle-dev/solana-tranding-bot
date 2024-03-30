import { ApplicableSystems } from '../ServerConfigurations';
import { BaseServer } from '@core/baseServer/BaseServer';

import { AuditModel } from '@common/models/Audit';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { ServerConfiguration } from '@core/baseServer/types/ServerConfiguration';


export class PostProcessorServer extends BaseServer<ApplicableSystems> {
  constructor(private basePath: string, opts: ServerConfiguration<ApplicableSystems>) { 
    super(opts); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('analyzer server starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();
    const auditProvider = new AuditProvider(etcdProvider);

    try {
      etcdProvider.startElection(PostProcessorServer.name);
      etcdProvider.onElection('elected', async elected => {
        try {
          if (elected) {
            for (const prefix of [ 'audit/calculateStats', 'audit/live', 'audit/livesim', 'audit/historicalsim' ] as AuditModel<any>['Prefix'][]) {
              auditProvider.startWatcherForAuditAction({ prefix: prefix });
              auditProvider.onWatchAuditAction(prefix, async audit => {
                this.zLog.debug(`incoming audit entry: ${JSON.stringify(audit, null, 2)}`);
              })
            }
          }
        } catch (err) {
          this.zLog.error(err);
          process.exit(1);
        }
      });
    } catch (err) {
      this.zLog.error(err);
      throw err;
    }
  };
}