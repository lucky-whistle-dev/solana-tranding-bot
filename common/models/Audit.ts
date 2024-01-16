import { EtcdModel } from '@core/models/EtcdModel';
import { InferType, InferTypeDeep } from '@core/types/Infer';
import { ISODateString } from '@core/types/ISODate';
import { TokenAddress } from '@common/types/token/Token';


export type AuditKeyPrefix = 'auditTrail';
export type AuditKeySuffix = ISODateString;

export type PreProcessorAction = 'calculateStats';
export type TraderAction = 'swap';
export type PostProcessorAction = 'updateRisk' | 'updateExpectedGain' | 'updateStopLoss';

export type Action = 
  TraderAction 
  | PreProcessorAction 
  | PostProcessorAction;

export interface AuditAction<T, V>{
  action: InferType<T, true>;
  payload: InferTypeDeep<V>;
}

export type AuditHoldings = { 
  [token: TokenAddress]: { 
    amount: number,
    updatedAt: ISODateString,
    averagePriceBought: number;
  }
};

export interface AuditPerformance {
  successRate: number;
  totalTrades: number;
}

export interface AuditEntry<V> {
  action: AuditAction<Action, V>;
  auditEntrySource: string;
  holdings: AuditHoldings;
  performance: AuditPerformance;
  timestamp: ISODateString;
}

export type AuditModel<V> = EtcdModel<AuditEntry<V>, AuditKeySuffix, AuditKeyPrefix>;