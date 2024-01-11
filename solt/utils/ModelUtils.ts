export const calculateEMA = (current: number, prevEMA: number, totalPoints: number): number => {
  const smoothingFactor = (() => 2 / (1 + totalPoints))();
  return (smoothingFactor * current) + ((1 - smoothingFactor) * prevEMA);
}

export const calculateSlope = (emaEnd: number, emaStart: number, tEnd: number, tStart: number): number => {
  return ((emaEnd - emaStart) / (tEnd - tStart));
}