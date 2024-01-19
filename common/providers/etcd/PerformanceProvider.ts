import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { ISODateString } from '@core/types/ISODate';
import { InferType } from '@core/types/Infer';
import { PerformanceModel } from '@common/models/Performance';


export class PerformanceProvider {
  constructor(private etcdProvider: ETCDProvider, private zLog: LogProvider = new LogProvider(PerformanceProvider.name)) {}

  async updatePerformanceProfile(payload: InferType<PerformanceModel['ValueType'], 'OMIT', 'v' | 'updatedAt'>): Promise<{ key: PerformanceModel['KeyType'], value: PerformanceModel['ValueType'] }> {
    const key: PerformanceModel['KeyType'] = 'performance/summary';
    const validatedPayload = await this.generateValidatedPayload(payload);
    
    await this.etcdProvider.put({ key, value: validatedPayload });
    return { key, value: validatedPayload };
  }
  
  async getByKey(key: PerformanceModel['KeyType']): Promise<InferType<PerformanceModel['ValueType'], 'PARTIAL'>> {
    return this.etcdProvider.get(key);
  }

  private async generateValidatedPayload(partialPayload: InferType<PerformanceModel['ValueType'], 'OMIT', 'v' | 'updatedAt'>): Promise<InferType<PerformanceModel['ValueType'], 'REQUIRE ALL'>> {
    const current = await this.getByKey('performance/summary');
    
    const now = new Date();
    const formattedNow: ISODateString = now.toISOString() as ISODateString;
    const validatedPayload = { v: current.v + 1, updatedAt:formattedNow, ...partialPayload };
    
    this.zLog.debug(`validated payload for audit entry: ${JSON.stringify(validatedPayload, null, 2)}`);
    return validatedPayload;
  }
}