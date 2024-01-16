import { EtcdModel } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';
import { TokenAddress } from '@common/types/token/Token';


export type PerformanceKeyPrefix = 'performance';
export type PerformanceKeySuffix = ISODateString;

export type PortfolioHoldings = { 
  [token: TokenAddress]: { 
    amount: number;
    updatedAt: ISODateString;
    averagePriceBought: number;
    successRate: number;
  }
};

export interface PerformanceEntry {
  successRate: number;
  totalTraders: number;
  currentPortfolio: PortfolioHoldings;
  expectedDailyGain: number;
  maxStopLoss: number;
  timestamp: ISODateString;
}

export type PerformanceSchema = EtcdModel<PerformanceEntry, PerformanceKeySuffix, PerformanceKeyPrefix>;