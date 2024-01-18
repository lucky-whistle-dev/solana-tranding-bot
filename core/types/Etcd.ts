import { ILeaseOptions, IKeyValue, IWatchResponse } from 'etcd3';

import { Etcd3PrefixedKey, EtcdModel } from '@core/models/EtcdModel';
import { InferType } from '@core/types/Infer';


export type ElectionEvent = 'elected';
export type ElectionListener = (elected: boolean) => void;

export type WatchEvent = 'data' | 'delete' | 'put';
export type WatchListener<EVT extends WatchEvent> = 
  EVT extends 'data' ? (watchResp: IWatchResponse) => void : (keyVal: IKeyValue) => void;

export type InitWatchOpts<EVT extends 'key' | 'prefix', K extends string, PRF = unknown> = 
  EVT extends 'key' ? { key: Etcd3PrefixedKey<K, PRF> } : { prefix: PRF extends string ? PRF : never };

export type WatchEventData<EVT extends WatchEvent> = 
  EVT extends 'data' ? IWatchResponse : IKeyValue;

export interface CreateLeaseOptions {
  ttl: number;
  opts?: ILeaseOptions;
}

type SORT_FIELD = 'Create' | 'Key' | 'Value' | 'Version' | 'Mod';
type SORT_DIR = 'Ascend' | 'Descend';

type __baseDataProcessOpts = {
  limit?: number;
  sort?: { on: SORT_FIELD, direction: SORT_DIR };
};

export type ETCDDataProcessingOpts<V, K extends string, PRF = unknown, TYP extends 'iterate' | 'range' = 'iterate'> =
  TYP extends 'iterate' 
  ? (PRF extends string ? { prefix: EtcdModel<V, K, PRF>['Prefix'] } & __baseDataProcessOpts : never)
  : TYP extends 'range'
  ? { range: { start: EtcdModel<V, K>['KeyType'], end: EtcdModel<V, K>['KeyType'] } } & __baseDataProcessOpts
  : never;

export type GetAllResponse<V, K extends string, PRF = unknown> = { [key in keyof Etcd3PrefixedKey<K, PRF>]: V };

export const ELECTION_EVENTS: { [event in ElectionEvent]: event } = { elected: 'elected' };
export const WATCH_EVENTS: { [event in WatchEvent]: event } = { data: 'data', delete: 'delete', put: 'put' };

export const ELECTION_ERROR_TIMEOUT_IN_MS = 5000;