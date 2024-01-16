import { EtcdModel } from '@core/models/EtcdModel';
import { InferType } from '@core/types/Util';
import { ISODateString } from '@core/types/ISODate';


export type StatsKeyPrefix = 'tokenStats';
export type StatsKeySuffix = ISODateString;

export type ShortInterval = 1 | 7;
export type LongInterval = 50 | 200;

export type StatsForInterval<T> = {
  interval: InferType<T>;
  ema: number;
  std: number;
  zscore: number;
};

export interface StatsEntry {
  shortTerm: StatsForInterval<ShortInterval>;
  longTerm: StatsForInterval<LongInterval>;
  timestamp: ISODateString;
}

export type TokenStatsModel = EtcdModel<StatsEntry, StatsKeySuffix, StatsKeyPrefix>;