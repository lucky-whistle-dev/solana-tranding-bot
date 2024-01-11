export type ExecutionOutcomes = 'buy' | 'sell' | 'hold';
export interface ExecutionResponse {
  outcome: ExecutionOutcomes;
}

export type KEY_PREFIX = 'ema';
export type APPLICABLE_EMAS = 'ema7' | 'ema50';

export const EMA_KEYS: { [ema in APPLICABLE_EMAS]: string } = {
  ema7: '7day',
  ema50: '50day'
};

export interface EMAEntry {
  ema: number;
  n: number;
}