import { ApplicableSystems } from '../ServerConfigurations';
import { BaseServer } from '@core/baseServer/BaseServer';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { ProcessorSchedulerProvider } from '@preprocessor/providers/ProcessorSchedulerProvider';
import { StartupProvider } from '@preprocessor/providers/StartupProvider';
import { ServerConfiguration } from '@core/baseServer/types/ServerConfiguration';


export class PreProcessorServer extends BaseServer<ApplicableSystems> {
  constructor(private basePath: string, opts: ServerConfiguration<ApplicableSystems>) { 
    super(opts); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('preprocessor server starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();
    const schedulerProvider = new ProcessorSchedulerProvider();
    const startupProvider = new StartupProvider();

    try {
      etcdProvider.startElection(PreProcessorServer.name);
      etcdProvider.onElection('elected', async elected => {
        try {
          if (elected) {
            await startupProvider.start();
            schedulerProvider.start();
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