import { EtcdModel } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';
import { TokenSymbol } from '@common/types/token/Token';


export type AccountKeyPrefix = 'account';
export type AccountKeySuffix<TKN extends TokenSymbol> = TKN;

export type AccountEntry = {
  balance: number;
  aggregatedTotalCost: number;
  realizedProfit: number;
  averagePriceBought: number;
  trades: { success: number, loss: number };
  totalTrades: number;
  zScoreThresholds: { upper: number, lower: number };
  updatedAt: ISODateString;
}

export type AccountModel = EtcdModel<AccountEntry, AccountKeySuffix<TokenSymbol>, AccountKeyPrefix>;