import { BaseServer } from '@baseServer/core/BaseServer';
import { ETCDProvider } from '@core/providers/EtcdProvider';


export class AnalyzerServer extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('analyzer server starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();

    try {
      etcdProvider.startElection(AnalyzerServer.name);
      etcdProvider.onElection('elected', elected => {
        try {
          if (elected) this.zLog.info('do nothing yet, not fully implemented');
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