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

export const calculateSlope = (emaEnd: number, emaStart: number, tEnd: number, tStart: number): number => {
  return ((emaEnd - emaStart) / (tEnd - tStart));
}