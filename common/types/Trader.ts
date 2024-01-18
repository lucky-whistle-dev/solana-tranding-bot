import { SignalGenerator } from '@common/types/Signal';
import { ISODateString } from '@core/types/ISODate';

export interface SimulationOpts {
  simulationType: 'live' | 'historical';
  simulationTimeInMs: number;
  audit: { persistOnCompletion: boolean; };
  riskAversionGrade: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  portfolioSize: number;
  overrideSignalGenerator?: SignalGenerator;
}

export interface SimulationResults {
  successRate: number;
  totalTrades: number;
  portfolioSize: { start: number, end: number };
  percentChange: number;

  auditStart: ISODateString;
  auditEnd: ISODateString;
}

export type TraderMode = 'production' | 'simLive' | 'simHistorical' | 'offline';