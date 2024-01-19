import { EtcdModel } from '@core/models/EtcdModel';
import { InferType } from '@core/types/Infer';
import { ISODateString } from '@core/types/ISODate';


export type AuditKeyPrefix = 'audit';
export type AuditKeySuffix<T extends Action> = `${T}/${ISODateString}`

export type PreProcessorAction = 'calculateStats';
export type TraderAction = 'live' | 'livesim' | 'historicalsim';
export type PostProcessorAction = 'updaterisk' | 'updateperformance';
export type Status = 'In Progress' | 'Finished' | 'Failed'

export type Action = 
  TraderAction 
  | PreProcessorAction 
  | PostProcessorAction;

export interface AuditAction<T extends Action, V>{
  action: InferType<T>;
  payload: InferType<V>;
}

export interface AuditEntry<V> {
  action: AuditAction<Action, V>;
  auditEntrySource: string;
  timestamp: ISODateString;
}

export type AuditModel<V> = EtcdModel<AuditEntry<V>, AuditKeySuffix<Action>, AuditKeyPrefix>;