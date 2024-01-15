import { EtcdSchema } from '@core/models/EtcdModel';
import { ISODateString } from '@core/types/ISODate';


export type StatsKeyPrefix = 'tokenStats';
export type StatsKeySuffix = ISODateString;

export type ShortInterval = 1 | 7;
export type LongInterval = 50 | 200;

type TimeInterval<T extends ShortInterval | LongInterval> = 
  T extends ShortInterval
  ? ShortInterval 
  : LongInterval;

export type StatsForInterval<T extends ShortInterval | LongInterval> = {
  interval: TimeInterval<T>;
  ema: number;
  std: number;
  zscore: number;
};

export interface StatsEntry<SHRT extends ShortInterval = undefined, LONG extends LongInterval = undefined> {
  shortTerm: SHRT extends undefined ? StatsForInterval<7> : StatsForInterval<SHRT>;
  longTerm: LONG extends undefined ? StatsForInterval<50> : StatsForInterval<LONG>;
  timestamp: ISODateString;
}

export type TokenStatsSchema<SHRT extends ShortInterval = 7, LONG extends LongInterval = 50> = 
  EtcdSchema<StatsKeySuffix, StatsEntry<SHRT, LONG>, StatsKeyPrefix>;