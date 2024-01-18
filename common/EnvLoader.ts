import { env } from 'process';

import { SignalGenerator } from '@common/types/Signal';
import { Timeframe } from '@common/types/token/Token';
import { LongInterval, ShortInterval } from '@common/models/TokenStats';
import { TraderMode } from '@trader/types/Trader';


type EnvironementKey = 
  'BIRDEYE_API_KEY'
  | 'SELECTED_MODE'
  | 'SELECTED_SIGNAL_GENERATOR'
  | 'SELECTED_SHORT_TERM_INTERVAL'
  | 'SELECTED_LONG_TERM_INTERVAL'
  | 'SELECTED_TIMEFRAME'
  | 'TOKEN_ADDRESS'
  | 'WALLET_PRIVATE_KEY';

type EnvValue<T extends EnvironementKey> = 
  T extends 'SELECTED_MODE'
  ? TraderMode
  : T extends 'SELECTED_SIGNAL'
  ? SignalGenerator
  : T extends 'SELECTED_TIMEFRAME'
  ? Timeframe
  : T extends 'SELECTED_SHORT_TERM_INTERVAL'
  ? ShortInterval
  : T extends 'SELECTED_LONG_TERM_INTERVAL'
  ? LongInterval
  : string;

const SOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112';

const envValueValidator = <T extends EnvironementKey>(envKey: T): EnvValue<T> => {
  if (envKey === 'SELECTED_MODE') return (env[envKey as string] as TraderMode ?? 'simHistorical') as EnvValue<T>;
  if (envKey === 'SELECTED_SIGNAL_GENERATOR') return (env[envKey as string] as SignalGenerator ?? 'hybridtrend') as EnvValue<T>;
  if (envKey === 'SELECTED_TIMEFRAME') return (env[envKey as string] ?? '5m') as EnvValue<T>;
  if (envKey === 'TOKEN_ADDRESS') return (env[envKey as string] ?? SOL_TOKEN_ADDRESS) as EnvValue<T>;
  if (envKey === 'SELECTED_SHORT_TERM_INTERVAL') return (parseInt(env[envKey as string]) ?? 7) as EnvValue<T>;
  if (envKey === 'SELECTED_LONG_TERM_INTERVAL') return (parseInt(env[envKey as string] ) ?? 50) as EnvValue<T>

  return env[envKey as string] as EnvValue<T>;
}

export const envLoader: { [envKey in EnvironementKey]: EnvValue<envKey> } = {
  BIRDEYE_API_KEY: envValueValidator('BIRDEYE_API_KEY'),
  SELECTED_MODE: envValueValidator('SELECTED_MODE'),
  SELECTED_SIGNAL_GENERATOR: envValueValidator('SELECTED_SIGNAL_GENERATOR'),
  SELECTED_SHORT_TERM_INTERVAL: envValueValidator('SELECTED_SHORT_TERM_INTERVAL'),
  SELECTED_LONG_TERM_INTERVAL: envValueValidator('SELECTED_LONG_TERM_INTERVAL'),
  SELECTED_TIMEFRAME: envValueValidator('SELECTED_TIMEFRAME'),
  TOKEN_ADDRESS: envValueValidator('TOKEN_ADDRESS'),
  WALLET_PRIVATE_KEY: envValueValidator('WALLET_PRIVATE_KEY')
}