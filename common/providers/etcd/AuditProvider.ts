import { hostname } from 'os';
import { Watcher } from 'etcd3';
import EventEmitter from 'events';
import lodash from 'lodash';
const { first, transform } = lodash;

import { envLoader } from '@common/EnvLoader';
import { Action, AuditModel } from '@common/models/Audit';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { ETCDDataProcessingOpts, GetAllResponse } from '@core/types/Etcd';
import { ISODateString } from '@core/types/ISODate';
import { InferType } from '@core/types/Infer';
import { ValueSerializer } from '@core/models/EtcdModel';


const HOSTNAME = hostname();

export class AuditProvider extends EventEmitter {
  constructor(private etcdProvider: ETCDProvider, private zLog: LogProvider = new LogProvider(AuditProvider.name)) { super(); }

  async startWatcherForAuditAction<V>(opts: { prefix: AuditModel<V>['Prefix']}) {
    await this.etcdProvider.startWatcher({ prefix: opts.prefix });
    this.etcdProvider.onWatch('put', keyVal  => {
      const audit: AuditModel<V>['ValueType'] =  ValueSerializer.deserialize<AuditModel<V>['ValueType'], AuditModel<V>['KeyType']>(keyVal.value);      
      super.emit('audit', audit);
    });
  }

  onWatchAuditAction<V>(event: AuditModel<V>['Prefix'], listener: (audit: AuditModel<V>['ValueType']) => Promise<void>) {
    return super.on(event, listener);
  }

  async insertAuditEntry<V>(payload: InferType<AuditModel<V>['ValueType'], 'PICK', 'action'>): Promise<{ key: AuditModel<V>['KeyType'], value: AuditModel<V>['ValueType'] }> {
    const now = new Date();
    const formattedNow: ISODateString  = now.toISOString() as ISODateString;

    const key: AuditModel<V>['KeyType'] = `audit/${payload.action.action}/${formattedNow}`;
    const validatedPayload = await this.generateValidatedPayload({ auditEntrySource: HOSTNAME, timestamp: formattedNow, ...payload });
    
    await this.etcdProvider.put({ key, value: validatedPayload });
    return { key, value: validatedPayload };
  }
  
  async getByKey<V>(key: AuditModel<V>['KeyType']): Promise<InferType<AuditModel<V>['ValueType'], 'PARTIAL'>> {
    return this.etcdProvider.get(key);
  }

  async getLatest<V>(opts: { action: Action }): Promise<AuditModel<V>['ValueType']> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      prefix: `audit/${opts.action}`, sort: { on: 'Key', direction: 'Descend' }, limit: 1 
    });

    const latestEntry = getAllResp[first(Object.keys(getAllResp))];
    return latestEntry;
  }

  async iterateFromLatest<V>(opts: InferType<AuditProcessingOpts<AuditModel<V>['ValueType'], 'iterate'>, 'OPTIONAL', 'sort' | 'limit'>): Promise<AuditModel<V>['ValueType'][]> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      prefix: opts.prefix, sort: opts?.sort ? opts.sort : { on: 'Key', direction: 'Descend' }, limit: opts.limit > 1 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  async range<V>(opts: AuditProcessingOpts<V, 'range'>): Promise<AuditModel<V>['ValueType'][]> {
    const getAllResp: GetAllResponse<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix']> = await this.etcdProvider.getAll({ 
      range: opts.range, sort: opts?.sort ? opts.sort : { on: 'Key', direction: 'Descend' }, ...(opts?.limit ? { limit: opts.limit > 1 ? opts.limit : 1 } : null)
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  private async generateValidatedPayload<V>(partialPayload: InferType<AuditModel<V>['ValueType'], 'PARTIAL'>): Promise<InferType<AuditModel<V>['ValueType'], 'REQUIRE ALL'>> {
    const latest = await this.getLatest<V>(partialPayload.action);
    const validatedPayload = { ...latest, ...partialPayload };
    
    this.zLog.debug(`validated payload for audit entry: ${JSON.stringify(validatedPayload, null, 2)}`);
    return validatedPayload;
  }
}


type AuditProcessingOpts<V, TYP extends 'iterate' | 'range'= 'iterate'> = 
  ETCDDataProcessingOpts<AuditModel<V>['ValueType'], AuditModel<V>['KeyType'], AuditModel<V>['Prefix'], TYP>;