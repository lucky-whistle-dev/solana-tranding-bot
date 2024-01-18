import { EtcdModel } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';
import { TokenAddress } from '@common/types/token/Token';
import { InferType } from '@core/types/Infer';


export type PerformanceKeyPrefix = 'performance';
export type PerformanceKeyId = 'summary' | 'account';
export type PerformanceKeySuffix<ID extends PerformanceKeyId, T extends TokenAddress> = 
  ID extends 'summary' ? ID : `${ID}/${T}`;

type __confidenceLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type __performanceSummary = {
  v: number
  aggregatedSuccessRate: number;
  performanceTrend: number;
  confidence: __confidenceLevels;
  targetGain: number;
  maxLoss: number;
  profileBalance: { inital: number, current: number };
  realizedProfit: number;
  updatedAt: ISODateString;
}

type __performanceAccount = {
  [token: TokenAddress]: {
    balance: number,
    aggregatedTotalCost: number;
    realizedProfit: number;
    averagePriceBought: number;
    trades: { success: number, loss: number };
    totalTrades: number;
    zScoreThresholds: { upper: number, lower: number };
    updatedAt: ISODateString
  };
}


export type PerformanceProfile = InferType<__performanceSummary, 'REQUIRE ALL'> & InferType<__performanceAccount, 'PARTIAL'>

export type PerformanceSchema = EtcdModel<PerformanceProfile, PerformanceKeySuffix<PerformanceKeyId, TokenAddress>, PerformanceKeyPrefix>;