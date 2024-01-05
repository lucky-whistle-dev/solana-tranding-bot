import { BaseServer } from '@baseServer/core/BaseServer';

export class InitSolTService extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('solt service starting...');

    return true;
  }

  startEventListeners = async (): Promise<void> => null;
}