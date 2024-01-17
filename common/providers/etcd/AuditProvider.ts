import { hostname } from 'os';
import lodash from 'lodash';
const { first, transform } = lodash;

import { envLoader } from '@common/EnvLoader';
import { AuditModel } from '@common/models/Audit';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { ETCDDataProcessingOpts, GetAllResponse } from '@core/types/Etcd';
import { ISODateString } from '@core/types/ISODate';


const HOSTNAME = hostname();

export class AuditProvider {
  constructor(private etcdProvider: ETCDProvider, private zLog: LogProvider = new LogProvider(AuditProvider.name)) {}

  async insertAuditEntry<V>(payload: Pick<AuditModel<V>['ValueType'], 'action'>): Promise<{ key: AuditModel<V>['KeyType'], value: AuditModel<V>['ValueType'] }> {
    const now = new Date();
    const formattedNow: ISODateString  = now.toISOString() as ISODateString;

    const key: AuditModel<V>['KeyType'] = `auditTrail/${formattedNow}`;
    const validatedPayload = await this.generateValidatedPayload({ auditEntrySource: HOSTNAME, timestamp: formattedNow, ...payload });
    
    await this.etcdProvider.put({ key, value: validatedPayload });
    return { key, value: validatedPayload };
  }
  
  async getByKey<V>(key: AuditModel<V>['KeyType']): Promise<Partial<AuditModel<V>['ValueType']>> {
    return this.etcdProvider.get(key);
  }

  async getLatest<V>(): Promise<AuditModel<V>['ValueType']> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'auditTrail', sort: { on: 'Key', direction: 'Descend' }, limit: 1 
    });

    const latestEntry: AuditModel<V>['ValueType'] = getAllResp[first(Object.keys(getAllResp))];
    return latestEntry;
  }

  async iterateFromLatest<V>(opts: Pick<AuditProcessingOpts<AuditModel<V>['ValueType']>, 'sort' | 'limit'>): Promise<AuditModel<V>['ValueType'][]> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'auditTrail', sort: opts?.sort ? opts.sort : { on: 'Key', direction: 'Descend' }, limit: opts.limit > 1 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  async range<V>(opts: AuditProcessingOpts<V, 'range'>): Promise<AuditModel<V>['ValueType'][]> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      range: opts.range, sort: opts?.sort ? opts.sort : { on: 'Key', direction: 'Descend' }, ...(opts?.limit ? { limit: opts.limit > 1 ? opts.limit : 1 } : null)
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  private async generateValidatedPayload<V>(
    partialPayload: Pick<AuditModel<V>['ValueType'], 'action' | 'auditEntrySource' | 'timestamp'>
  ): Promise<AuditModel<V>['ValueType']> {
    const latest = await this.getLatest<V>();
    const validatedPayload = { ...latest, ...partialPayload };
    
    this.zLog.debug(`validated payload for audit entry: ${JSON.stringify(validatedPayload, null, 2)}`);
    return validatedPayload;
  }
}


type AuditProcessingOpts<V, TYP extends 'iterate' | 'range'= 'iterate'> = 
  ETCDDataProcessingOpts<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix'], TYP>;