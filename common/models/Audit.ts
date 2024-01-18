import { EtcdModel } from '@core/models/EtcdModel';
import { InferType } from '@core/types/Infer';
import { ISODateString } from '@core/types/ISODate';
import { TokenAddress } from '@common/types/token/Token';


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

export type AuditHoldings = { 
  [token: TokenAddress]: {
    amount: number;
    updatedAt: ISODateString;
    totalCostOverTime: number;
    recognizedProfit: number;
    averagePriceBought: number;
    successfulTrades: number;
    totalTrades: number;
  }
};

export interface AuditPerformance {
  successRate: number;
  totalTrades: number;
  targetProfitPerDay: number;
  maxLoss: number;
  recognizedProfit: number;
  totalCost: number;
}

export interface AuditEntry<V> {
  action: AuditAction<Action, V>;
  auditEntrySource: string;
  holdings: AuditHoldings;
  performance: AuditPerformance;
  timestamp: ISODateString;
}

export type AuditModel<V> = EtcdModel<AuditEntry<V>, AuditKeySuffix<Action>, AuditKeyPrefix>;