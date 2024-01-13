import { BaseServer } from '@baseServer/core/BaseServer';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { ProcessorSchedulerProvider } from './providers/ProcessorSchedulerProvider';


export class PreProcessorServer extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('preprocessor server starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();
    const schedulerProvider = new ProcessorSchedulerProvider();

    try {
      etcdProvider.startElection(PreProcessorServer.name);
      etcdProvider.onElection('elected', elected => {
        try {
          if (elected) schedulerProvider.start();
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