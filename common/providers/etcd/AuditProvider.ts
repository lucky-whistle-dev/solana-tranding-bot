import { hostname } from 'os';
import lodash from 'lodash';
const { first, transform } = lodash;

import { Action, AuditEntry, AuditSchema } from '@common/models/Audit';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { ETCDDataProcessingOpts, GetAllResponse } from '@core/types/Etcd';
import { ISODateString } from '@core/types/ISODate';
import { SOL_TOKEN_ADDRESS } from '@config/Token';


const HOSTNAME = hostname();

export class AuditProvider {
  private zLog: LogProvider = new LogProvider(AuditProvider.name);

  constructor(private etcdProvider: ETCDProvider) {}

  async insertAuditEntry<T extends Action, V = string>(
    payload: Pick<(AuditSchema<T, V>)['parsedValueType'], 'action'>
  ): Promise<{ key: (AuditSchema<T, V>)['formattedKeyType'], value: (AuditSchema<T, V>)['parsedValueType'] }> {
    const now = new Date();
    const formattedNow: ISODateString = now.toISOString() as ISODateString;

    const key: (AuditSchema<T, V>)['formattedKeyType'] = `auditTrail/${formattedNow}`;
    const validatedPayload: Required<(AuditSchema<T, V>)['parsedValueType']> = await this.generateValidatedPayload({ auditEntrySource: HOSTNAME, timestamp: formattedNow, ...payload });
    
    await this.etcdProvider.put<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType']>(key, validatedPayload);
    return { key, value: validatedPayload };
  }

  async getByKey<T extends Action, V extends string>(key: (AuditSchema<T, V>)['formattedKeyType']): Promise<(AuditSchema<T, V>)['parsedValueType']> {
    return this.etcdProvider.get<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType']>(key);
  }

  async getLatest<T extends Action, V>(): Promise<(AuditSchema<T, V>)['parsedValueType']> {
    const getAllResp: GetAllResponse<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType'], (AuditSchema<T, V>)['prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'auditTrail', sort: { on: 'Key', direction: 'Descend' }, limit: 1 
    });

    const latestEntry: (AuditSchema<T, V>)['parsedValueType'] = getAllResp[first(Object.keys(getAllResp))];
    return latestEntry;
  }

  async iterateFromLatest<T extends Action, V>(opts: Pick<AuditProcessingOpts<T, V>, 'limit'>): Promise<(AuditSchema<T, V>)['parsedValueType'][]> {
    const getAllResp: GetAllResponse<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType'], (AuditSchema<T, V>)['prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'auditTrail', sort: { on: 'Key', direction: 'Descend' }, limit: opts.limit > 9 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  async range<T extends Action, V>(opts: AuditProcessingOpts<T, (AuditSchema<T, V>)['parsedValueType'], 'range'>): Promise<(AuditSchema<T, V>)['parsedValueType'][]> {
    const getAllResp: GetAllResponse<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType']> = await this.etcdProvider.getAll({ 
      range: opts.range, sort: { on: 'Key', direction: 'Descend' }, limit: opts.limit > 9 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  private async generateValidatedPayload<T extends Action, V>(
    partialPayload: Pick<(AuditSchema<T, V>)['parsedValueType'], 'action' | 'auditEntrySource' | 'timestamp'>
  ): Promise<(Required<(AuditSchema<T, V>)['parsedValueType']>)> {
    const latest = await this.getLatest();
    const defaultPayload: Pick<AuditEntry<T, V>, 'holdings' | 'performance'> = {
      holdings: { 
        [`${SOL_TOKEN_ADDRESS}`]: { 
          amount: 0, originallyBoughtAt: '0000-00-00T00:00:00.000Z' as ISODateString, updatedAt: partialPayload.timestamp, averagePriceBought: 0 
        } 
      },
      performance: { successRate: 0, totalTrades: 0 }
    };

    const validatedPayload = { ...(latest ?? defaultPayload), ...partialPayload };
    this.zLog.debug(`validated payload for audit entry: ${JSON.stringify(validatedPayload, null, 2)}`);
    
    return validatedPayload;
  }
}


type AuditProcessingOpts<T extends Action, V = string, TYP extends 'iterate' | 'range' = 'iterate'> = 
  ETCDDataProcessingOpts<(AuditSchema<T, V>)['formattedKeyType'], (AuditSchema<T, V>)['parsedValueType'], (AuditSchema<T, V>)['prefix'], TYP>;