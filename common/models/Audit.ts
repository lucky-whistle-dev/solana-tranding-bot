import { TokenAddress } from '@common/types/Token';
import { EtcdSchema } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';


export type AuditKeyPrefix = 'auditTrail';
export type AuditKeySuffix = ISODateString;

export type PreprocessorAction = 'calculateEMA';
export type TraderAction = 'swap';
export type AnalyzerAction = 'updateRisk' | 'updateExpectedGain' | 'updateStopLoss';

export type Action = TraderAction | PreprocessorAction;

export interface AuditAction<T extends Action, V = string>{
  action: T;
  payload: V;
}

export type AuditHoldings = { 
  [token: TokenAddress]: { 
    amount: number,
    originallyBoughtAt: ISODateString,
    updatedAt: ISODateString,
    averagePriceBought: number;
  }
};

export interface AuditPerformance {
  successRate: number;
  totalTrades: number;
}

export interface AuditEntry<T extends Action, V = string> {
  action: AuditAction<T, V>;
  auditEntrySource: string;
  holdings: AuditHoldings;
  performance: AuditPerformance;
  timestamp: ISODateString;
}

export type AuditSchema<T extends Action, V = string> = EtcdSchema<AuditKeySuffix, AuditEntry<T, V>, AuditKeyPrefix>;