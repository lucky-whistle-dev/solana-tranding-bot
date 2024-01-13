import { StatsEntry, ShortInterval, LongInterval } from "@common/models/TokenStats";

export type Signal =  'BUY' | 'SELL' | 'NOOP';

export type GenerateSignalHelper<SHRT extends ShortInterval, LONG extends LongInterval> = (stats: StatsEntry<SHRT, LONG>) => Signal;