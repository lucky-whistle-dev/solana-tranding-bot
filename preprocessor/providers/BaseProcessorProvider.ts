import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';


export abstract class BaseProcessorProvider {
  protected etcProvider: ETCDProvider;
  protected zLog: LogProvider;

  constructor(protected name: string) { this.zLog = new LogProvider(this.name); } 

  abstract process(): Promise<boolean>;

  private init() {
    this.etcProvider = new ETCDProvider();
  }

  async run(): Promise<boolean> {
    try {
      this.init();
      return this.process();
    } catch (err) { this.zLog.error(`error on processor file: ${err}`); }
  }
}