import { EtcdModel } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';


export type PerformanceKeyPrefix = 'performance';
export type PerformanceKeySuffix = 'summary';

type __confidenceLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PerformanceProfile = {
  v: number;
  aggregatedSuccessRate: number;
  performanceTrend: number;
  confidence: __confidenceLevels;
  targetGain: number;
  maxLoss: number;
  profileBalance: { inital: number, current: number };
  realizedProfit: number;
  updatedAt: ISODateString;
}

export type PerformanceModel = EtcdModel<PerformanceProfile, PerformanceKeySuffix, PerformanceKeyPrefix>;