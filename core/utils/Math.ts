export const calculateEMA = (current: number, prevEMA: number, iterations: number): number => {
  const smoothingFactor = (() => 2 / (1 + iterations))();
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

export const calculateStdEMA = (current: number, prevEMA: number, prevStd: number, iterations: number): number => {
  const smoothingFactor = (() => 2 / (1 + iterations))();
  
  const ema = calculateEMA(current, prevEMA, iterations);
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