# Strategy


## Overview

Building a successful automated trading platform involves a multi-step approach, or pipeline, to make informed decisions regarding potential trade opportunities. This project looks to build a modular and configurable platform that includes, in order from start to finish:
  
  - data preprocessing
  - signal generation 
  - trade execution
  - audit trail
  - risk management
  - backtesting

The platform is divided into three separate services:


### preprocessor

The `preprocessor` service handles building and cleaning timeseries data on historical price data for selected timeframes and traded assets. The `preprocessor` is a composable service that includes an internal scheduler that runs `processors`. These `processors` are standalone executables that are responsible for extracting relevant data from the selected asset and timeframe. The data is indexed in ascending order and contains the following model for each event:
```ts
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
```

The preprocessed events can then be ingested by the trader service for further processing.


### trader

The `trader` service handles generating signals from live data and determing what action needs to be taken on the current data based on an overall confidence score. The confidence score is a value that is a weight between the overall confidence of the signal as well as overall confidence from past performance of the `trader` service. When an action is performed, the `trader` creates an audit of the event, containing the action taken and a payload containing relevant metadata to be postprocessed for risk management and global constants. The audit trail is indexed in sorted order and contains the following model for each event:
```ts
export type AuditKeyPrefix = 'audit';
export type AuditKeySuffix<T extends Action> = `${T}/${ISODateString}`;

export interface AuditAction<T extends Action, V>{
  action: InferType<T>;
  payload: InferType<V>;
}

export interface AuditEntry<V> {
  action: AuditAction<Action, V>;
  auditEntrySource: string;
  timestamp: ISODateString;
}
```

Signal generation is handled through an extensible framework where different models can be created and selected depending on the overall strategy to be used. All signal generation executables contain the following structure:
```ts
import { subMinutes } from 'date-fns';
import lodash from 'lodash';
const { last } = lodash;

import { BaseSignalGeneratorProvider } from '@signals/BaseSignalGeneratorProvider';

import { LogProvider } from '@core/providers/LogProvider';
import { TokenSymbol } from '@common/types/token/Token';
import { envLoader } from '@common/EnvLoader';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { Signal } from '@common/types/Signal';
import { TokenStatsModel } from '@common/models/TokenStats';
// import other providers here


export class YourSignalProvider extends BaseSignalGeneratorProvider {
  constructor(
    auditProvider: AuditProvider, tokenStatsProvider: TokenStatsProvider,
    opts: { token: TokenSymbol, timeframe: Timeframe } = { token: envLoader.TOKEN_SYMBOL, timeframe: envLoader.SELECTED_TIMEFRAME }
  ) { super(auditProvider, tokenStatsProvider, opts, new LogProvider(YourTrendSignalProvider.name)); }

  protected async getApplicableStats(): Promise<TokenStatsModel['ValueType']> {
    // this method gets applicable statistics and events for handling incoming data
  }

  protected async runModel(opts: { price: number, stats: TokenStatsModel['ValueType'] }): Promise<Signal> {
    // this method executes the chosen strategy on the current price and the fetched applicable stats to produce a signal
  }
}
```

The `trader` service also handles the trading mode, which includes `live`, `live sim`, or `historical sim`, which can be modified in your environmental variables.

`live` mode handles live trades on the incoming price data for the selected timeframe. It ingests the signal returned from the signal generator and then determines whether or not to execute the signal based on a computed confidence score. `trader` then automatically executes the order and records the selected action in the audit trail.

`live sim` mode allows for backtesting on live data. The incoming price data produces a signal and the `trader` executes a dummy trade on a predefined set of parameters. This allows for seeing how the `trader` will execute trades in real time without the need to risk real money.

`historical sim` mode performs the same actions as above, but on a predefined set of historical data. This can be utilized to precompute system parameters and confidence before moving to live data.


### postprocessor

`postprocessor` handles generating confidence levels and tracking overall system performance utilizing both historical asset data and live audit data from generated system events. The `postprocessor` sets up an event listener to receive incoming audit entries generated from the `trader` service. System performance is stored in the following model:
```ts
export type PerformanceKeyPrefix = 'performance';
export type PerformanceKeySuffix = 'summary';

type __confidenceLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PerformanceProfile = {
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
```

Individual asset accounts are also tracked, which include relevant asset statistics and overall system statistics for that particular asset, contained in the following model structure:
```ts
export type AccountKeyPrefix = 'account';
export type AccountKeySuffix<TKN extends TokenSymbol> = TKN;

export type AccountEntry = {
  v: number
  balance: number;
  confidence: number
  aggregatedTotalCost: number;
  realizedProfit: number;
  averagePriceBought: number;
  trades: { success: number, loss: number };
  totalTrades: number;
  zScoreThresholds: { upper: number, lower: number };
  updatedAt: ISODateString;
}
```

When an audit entry is received, the `postprocessor` gets the performance summary as well as the asset accounts involved in the metadata in the audit entry. The appropriate fields on each object are recomputed for the `trader` service to then utilize to determine signal handling.


## Selected Data

When performing trades, it is important to select relevant data since noisy data can generate faulty signals, resulting in poor strategy performance. By transforming historical price data before being traded, the two can first be decoupled and the signal generation can then utilize cleaned and precomputed variables. The following statistics have been selected to track. Each timeframe for selected assets is processed in parallel onto separate timeseries for clear separation: 

`ohlc`: 

The open, high, low, and close values for the current frame are stored to provide all relevant price information.

`ema`:

The exponential moving average is calculated with the following:
```ts
export const calculateEMA = (
  current: number, prevEMA: number, opts: { periods: number, timeframe: Timeframe, interval: 'hour' | 'day' }
): number => {
  const smoothingFactor = (() => 2 / (1 + periodsForTimeframe(opts)))();
  return (smoothingFactor * current) + ((1 - smoothingFactor) * prevEMA);
}
```

`std`:

The exponentiated standard deviation is taken with the following:
```ts
export const calculateStdEMA = (
  current: number, prevEMA: number, prevStd: number, opts: { periods: number, timeframe: Timeframe, interval: 'hour' | 'day' }
): number => {
  const smoothingFactor = (() => 2 / (1 + periodsForTimeframe(opts)))();
  
  const ema = calculateEMA(current, prevEMA, opts);
  const deviation = Math.pow(calculateDeviation(current, ema), 2);
  const computed = (smoothingFactor * deviation) + ((1 - smoothingFactor) * Math.pow(prevStd, 2));

  return Math.sqrt(computed);
}
```

`z-score`

The z-score is calculated using:
```ts
export const calculateZScore = (current: number, mean: number, std: number): number => {
  return calculateDeviation(current, mean) / std;
}
```

To derive accurate calculations for the selected timeframe and the intervals for `ema`, `std`, and `z-score`, the following resolves to the selected:
```ts
export const timeFramesPerUnit: { [tf in Timeframe]?: { min: number, hour: number, day: number } } = {
  '1m': { min: 1, hour: MIN_IN_HOUR, day: MIN_IN_DAY },
  '5m': { min: 5, hour: MIN_IN_HOUR / 5, day: MIN_IN_DAY / 5 },
  '15m': { min: 15, hour: MIN_IN_HOUR / 15, day: MIN_IN_DAY / 15},
  '1h': { min: MIN_IN_HOUR, hour: 1, day: 24 },
  '4h': { min: MIN_IN_HOUR * 4, hour: 4, day: 24 / 4 }
}
```


## Evaluating Risk

