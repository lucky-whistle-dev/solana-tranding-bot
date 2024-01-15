export const calculateEMA = (current: number, prevEMA: number, iterations: number): number => {
  const smoothingFactor = (() => 2 / (1 + iterations))();
  return (smoothingFactor * current) + ((1 - smoothingFactor) * prevEMA);
}

export const calculateSMA = (values: number[]): number => {
  let sum = 0;
  for (const value of values) {
    sum += value;
  }

  return sum /values.length;
}

export const calculateDeviation = (n1: number, n2: number): number => n1 - n2;

export const calculateStdSMA = (values: number[]): number => {
  const mean = calculateSMA(values);
  
  let computedSeries = 0;
  for (const value of values) {
    computedSeries += Math.pow(calculateDeviation(value, mean), 2);
  }

  return Math.sqrt(computedSeries / (values.length - 1));
}

export const calculateStdEMA = (current: number, ema: number, prevStd: number, iterations: number): number => {
  const computed = (Math.pow(calculateDeviation(current, ema), 2)) / (iterations - 1) + prevStd;
  return Math.sqrt(computed);
}

export const calculateZScore = (current: number, mean: number, std: number): number => {
  return calculateDeviation(current, mean) / std;
}

export const calculateSlope = (emaEnd: number, emaStart: number, tEnd: number, tStart: number): number => {
  return ((emaEnd - emaStart) / (tEnd - tStart));
}