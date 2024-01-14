import { env } from 'process';


type EnvironementKey = 
  'BIRDEYE_API_KEY' 
  | 'WALLET_PRIVATE_KEY';

export const envLoader: { [envKey in EnvironementKey]: string } = {
  BIRDEYE_API_KEY: env.BIRDEYE_API_KEY,
  WALLET_PRIVATE_KEY: env.WALLET_PRIVATE_KEY
}