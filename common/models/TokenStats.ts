import { EtcdModel } from '@core/models/EtcdModel';
import { Timeframe } from '@core/utils/Math';
import { ISODateString } from '@core/types/ISODate';
import { TokenAddress, TokenSymbol } from '@common/types/token/Token';


export type ShortInterval = 1 | 7;
export type LongInterval = 50 | 200;

export type Interval = ShortInterval | LongInterval;

export type StatsKeyPrefix<TKN extends TokenSymbol, TME extends Timeframe> = `tokenStats/${TKN}/${TME}`
export type StatsKeySuffix = ISODateString;

type __intervalObj = { 
  [trm in 'short' | 'long']: { 
    interval: trm extends 'short' ? ShortInterval : LongInterval, 
    val: number 
  } 
};

export interface StatsEntry<TKN extends TokenSymbol, TNA extends TokenAddress, TME extends Timeframe> {
  tokenSymbol: TKN;
  tokenAddress: TNA
  timeframe: TME;
  ema: __intervalObj;
  std: __intervalObj;
  zscore: __intervalObj;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  timestamp: ISODateString;
}

export type TokenStatsModel = EtcdModel<StatsEntry<TokenSymbol, TokenAddress, Timeframe>, StatsKeySuffix, StatsKeyPrefix<TokenSymbol, Timeframe>>;