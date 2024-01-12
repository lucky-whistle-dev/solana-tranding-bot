import { Etcd3PrefixedKey } from '@core/models/EtcdModel';
import { ILeaseOptions, IKeyValue, IWatchResponse } from 'etcd3';


export type ElectionEvent = 'elected';
export type ElectionListener = (elected: boolean) => void;

export type WatchEvent = 'data' | 'delete' | 'put';
export type WatchListener<T extends WatchEvent> = 
  T extends 'data' 
  ? (watchResp: IWatchResponse) => void
  : (keyVal: IKeyValue) => void;

export interface CreateLeaseOptions {
  ttl: number;
  opts?: ILeaseOptions;
}

export type InitWatchOpts<T extends 'key' | 'prefix', K extends string = undefined, PRF extends string = undefined> = 
  T extends 'key'
  ? (K extends undefined ? never : { key: Etcd3PrefixedKey<K, PRF> })
  : (PRF extends undefined ? never : { prefix: PRF })

export type GetAllResponse<T extends string, V, PRF extends string = undefined> = { [key in Etcd3PrefixedKey<T, PRF>]: V };

export const ELECTION_ERROR_TIMEOUT_IN_MS = 5000;

export const ELECTION_EVENTS: { [event in ElectionEvent]: ElectionEvent } = {
  elected: 'elected'
};

export const WATCH_EVENTS: { [event in WatchEvent]: WatchEvent } = {
  data: 'data',
  delete: 'delete',
  put: 'put'
};