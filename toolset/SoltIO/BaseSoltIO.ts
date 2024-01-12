import { LogProvider } from '@core/providers/LogProvider';


export abstract class BaseSoltIO {
  constructor(protected zLog: LogProvider = new LogProvider('toolset --> SoltIO')) {}

  abstract runTest(): Promise<boolean>;

  async start(): Promise<boolean> {
    try {
      return this.runTest();
    } catch (err) { throw err; }
  }
}