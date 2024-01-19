import { env } from 'process';

import { Timeframe } from '@core/utils/Math';
import { SignalGenerator } from '@common/types/Signal';
import { LongInterval, ShortInterval } from '@common/models/TokenStats';
import { TraderMode } from '@common/types/Trader';


type EnvironementKey = 
  'BIRDEYE_API_KEY'
  | 'SELECTED_MODE'
  | 'SELECTED_SIGNAL_GENERATOR'
  | 'SELECTED_SHORT_TERM_INTERVAL'
  | 'SELECTED_LONG_TERM_INTERVAL'
  | 'SELECTED_TIMEFRAME'
  | 'TOKEN_ADDRESS'
  | 'TOKEN_SYMBOL'
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
  if (envKey === 'SELECTED_MODE') return (env[envKey] ?? 'simLive') as EnvValue<T>;
  if (envKey === 'SELECTED_SIGNAL_GENERATOR') return (env[envKey] ?? 'hybridtrend') as EnvValue<T>;
  if (envKey === 'SELECTED_TIMEFRAME') return (env[envKey] ?? '15m') as EnvValue<T>;
  if (envKey === 'TOKEN_ADDRESS') return (env[envKey] ?? SOL_TOKEN_ADDRESS) as EnvValue<T>;
  if (envKey === 'TOKEN_SYMBOL') return (env[envKey] ?? 'SOL') as EnvValue<T>;
  if (envKey === 'SELECTED_SHORT_TERM_INTERVAL') return (isNaN(parseInt(env[envKey])) ? 7 : parseInt(env[envKey])) as EnvValue<T>;
  if (envKey === 'SELECTED_LONG_TERM_INTERVAL') return (isNaN(parseInt(env[envKey])) ? 50 : parseInt(env[envKey])) as EnvValue<T>;

  return env[envKey] as EnvValue<T>;
}

export const envLoader: { [envKey in EnvironementKey]: EnvValue<envKey> } = {
  BIRDEYE_API_KEY: envValueValidator('BIRDEYE_API_KEY'),
  SELECTED_MODE: envValueValidator('SELECTED_MODE'),
  SELECTED_SIGNAL_GENERATOR: envValueValidator('SELECTED_SIGNAL_GENERATOR'),
  SELECTED_SHORT_TERM_INTERVAL: envValueValidator('SELECTED_SHORT_TERM_INTERVAL'),
  SELECTED_LONG_TERM_INTERVAL: envValueValidator('SELECTED_LONG_TERM_INTERVAL'),
  SELECTED_TIMEFRAME: envValueValidator('SELECTED_TIMEFRAME'),
  TOKEN_ADDRESS: envValueValidator('TOKEN_ADDRESS'),
  TOKEN_SYMBOL: envValueValidator('TOKEN_SYMBOL'),
  WALLET_PRIVATE_KEY: envValueValidator('WALLET_PRIVATE_KEY')
}