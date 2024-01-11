import { ILeaseOptions, IKeyValue, IWatchResponse } from 'etcd3';

export type ElectionEvent = 'elected';
export type ElectionListener = (elected: boolean) => void;

export type WatchEvent = 'data' | 'delete' | 'put';
export type KeyValListener = (keyVal: IKeyValue) => void;
export type WatchRespListener = (watchResp: IWatchResponse) => void;
export type WatchListener = KeyValListener | WatchRespListener;

export interface CreateLeaseOptions {
  ttl: number;
  opts?: ILeaseOptions;
}

export type KeyWatchOpts = { key: string };
export type PrefixWatchOpts = { prefix: string };
export type InitWatchOpts = KeyWatchOpts | PrefixWatchOpts;

export type GetAllResponse = { [key: string]: string };

export const ELECTION_ERROR_TIMEOUT_IN_MS = 5000;

export const ELECTION_EVENTS: { [event in ElectionEvent]: ElectionEvent } = {
  elected: 'elected'
};

export const WATCH_EVENTS: { [event in WatchEvent]: WatchEvent } = {
  data: 'data',
  delete: 'delete',
  put: 'put'
};