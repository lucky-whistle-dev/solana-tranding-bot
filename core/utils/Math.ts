export type Timeframe = '1m' | '5m' | '10m' | '15m' | '1h' | '4h' | '1d' | '1w';

const MIN_IN_HOUR = 60;
const MIN_IN_DAY = 24 * MIN_IN_HOUR;

export const timeFramesPerUnit: { [tf in Timeframe]?: { min: number, hour: number, day: number } } = {
  '1m': { min: 1, hour: MIN_IN_HOUR, day: MIN_IN_DAY },
  '5m': { min: 5, hour: MIN_IN_HOUR / 5, day: MIN_IN_DAY / 5 },
  '15m': { min: 15, hour: MIN_IN_HOUR / 15, day: MIN_IN_DAY / 15},
  '1h': { min: MIN_IN_HOUR, hour: 1, day: 24 },
  '4h': { min: MIN_IN_HOUR * 4, hour: 4, day: 24 / 4 }
}

export const periodsForTimeframe = (opts: { periods: number, timeframe: Timeframe, interval: 'hour' | 'day' }) => {
  return timeFramesPerUnit[opts.timeframe][opts.interval] * opts.periods;
}

export const calculateEMA = (
  current: number, prevEMA: number, opts: { periods: number, timeframe: Timeframe, interval: 'hour' | 'day' }
): number => {
  const smoothingFactor = (() => 2 / (1 + periodsForTimeframe(opts)))();
  return (smoothingFactor * current) + ((1 - smoothingFactor) * prevEMA);
}

export const calculateSMA = (values: number[]): number => {
  if (values.length < 1) throw new Error('values must be at least a series one element long')

  let sum = 0;
  for (const value of values) { sum += value; }
  return sum / values.length;
}

export const calculateDeviation = (curr: number, mean: number): number => curr - mean;

export const calculateStdSMA = (values: number[]): number => {
  if (values.length < 1) throw new Error('values must be at least a series one element long')

  const mean = calculateSMA(values);
  let computedSeries = 0;

  for (const value of values) { computedSeries += Math.pow(calculateDeviation(value, mean), 2); }
  return Math.sqrt(computedSeries / (values.length - 1));
}

export const calculateStdEMA = (
  current: number, prevEMA: number, prevStd: number, opts: { periods: number, timeframe: Timeframe, interval: 'hour' | 'day' }
): number => {
  const smoothingFactor = (() => 2 / (1 + periodsForTimeframe(opts)))();
  
  const ema = calculateEMA(current, prevEMA, opts);
  const deviation = Math.pow(calculateDeviation(current, ema), 2);
  const computed = (smoothingFactor * deviation) + ((1 - smoothingFactor) * Math.pow(prevStd, 2));

  return Math.sqrt(computed);
}

export const calculateZScore = (current: number, mean: number, std: number): number => {
  return calculateDeviation(current, mean) / std;
}

export const calculateSlope = (emaEnd: number, emaStart: number, tEnd: number, tStart: number): number => {
  if (tEnd <= tStart) throw new Error('slope cannot have intervals equalling to 0 or with end time less than start');
  return ((emaEnd - emaStart) / (tEnd - tStart));
}