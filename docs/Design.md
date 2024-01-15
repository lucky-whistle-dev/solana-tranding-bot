# SOLT


## Computation


### Overview

`SOLT` utilizes a hybrid [mean reversion](https://en.wikipedia.org/wiki/Mean_reversion_(finance)), focusing on determing overall momentum of the time series data to then determine how to handle deviations from the mean.


### Prereq

#### Exponential Moving Average

$$
\begin{align}
  &\alpha = \text{the current smoothing factor} \\
  &p_{t} = \text{the current price of the asset in a timeseries} \\
  &\bar{p} = \text{the current mean price of the asset} \\
  &n = \text{the number of periods that have occured} \\
  &t = \text{the current timeframe}
\end{align}
$$

$$
\begin{align}
  &\alpha = \frac{2}{1 + n}
\end{align}
$$

$$
\begin{align}
  &EMA(p_{t}, EMA_{t - 1}, n) = \alpha\times{p_{t}} + (1 - \alpha)\times{EMA_{t - 1}}
\end{align}
$$

#### Deviation

$$
\begin{align}
  &DEV(p_{t}, EMA_{t}) = p_{t} - EMA_{t}
\end{align}
$$

#### Standard Deviation

The standard deviation calculation used is not standard, but is an adaption where the current data's deviation is weighted more than historical points in the time series, which will be refered to as `exponential standard deviation`.

To calculate:

$$
\begin{align}
  &ESTD(p_{t}, EMA_{t}, ESTD_{t - 1}, n) = \sqrt{\alpha\times{DEV(p_{t}, EMA_{t})^{2}} + (1 - \alpha)\times{ESTD_{t - 1}^{2}}}
\end{align}
$$

#### Slope

$$
\begin{align}
  &\delta = \text{the slope, or rate of change}
\end{align}
$$

$$
\begin{align}
  &\delta = \frac{EMA_{t_{end}} - EMA_{t_{start}}}{t_{end} - t_{start}}
\end{align}
$$

#### Trend

$$
\begin{align}
  &\text{trend direction} =
  \begin{cases}
    \delta > 0 & \text{positive} \\
    \delta < 0 & \text{negative}
  \end{cases}
\end{align}
$$

#### z-score

$$
\begin{align}
  &\text{z-score}(p_{t}, EMA_{t}, ESTD_{t}) = \frac{DEV(p_{t}, EMA_{t})}{ESTD_{t}}
\end{align}
$$

#### z-score Thresholds

$$
\begin{align}
  &\text{threshold} =
  \begin{cases}
    \text{z-score} > 1.5 & \text{overbought} \\
    1.5 > \text{z-score} >= 0 & \text{positive insignificant} \\
    0 > \text{z-score} >= -1.5 & \text{negative insignificant} \\
    \text{z-score} > -1.5 & \text{oversold}
  \end{cases}
\end{align}
$$


### Algorithm

**NOTE**

```
short term trend --> 1 | 7 day EMA
long term trend --> 50 | 200 day EMA
timeframe interval --> 1 minute | 5 minute | 10 minute | 15 minute | 1 hour | 1 day
```

`The following pseudocode outlines generating trade signals for a selected asset.`

To generate signals `(BUY, NOOP, SELL)`:
```
func generate_signal(price, shortTermEMA, longTermEMA, shortTermTrend, longTermTrend, shortTermZScore, longTermZScore):
  shortTermThreshold = determineDeviationThreshold(shortTermZScore)
  longTermThreshold = determineDeviationThreshold(shortTermZScore)

  if longTermTrend > 0 && shortTermTrend > 0:
    // trend indicating increasing growth 

    if longTermTrend > shortTermTrend:
      // possible strong upward momentum with long term increasing faster than short term

      if shortTermThreshold >= positive insignificant && longTermThreshold >= positive insignificant:
        // deviation from mean shows possibly overbought
        return SELL

      if shortTermThreshold <= negative insignifcant && longTermThreshold == oversold:
        // deviation from mean shows possibly oversold
        return BUY
    
    else:
      // possible slowing upward momentum with short term increasing faster than long term

      if shortTermThreshold == oversold:
        // deviation from mean shows possibly overbought
        return SELL

      if shortTermThreshold == oversold && longTermThreshold <= negative insignificant:
        // deviation from mean shows possibly oversold
        return BUY
  
  if longTermTrend > 0 && shortTermTrend < 0:
    // trend indicating slowing growth 

    if longTermTrend > ABS_VALUE | shortTermTrend |:
      // possible weak upward momentum with long term increasing faster than short term

      if shortTermThreshold == overbought && longTermThreshold <= positive insignificant:
        // deviation from mean shows possibly overbought
        return SELL
      
      if shortTermThreshold <= negative insignificant && longTermThreshold <= negative insignificant:
        // deviation from mean shows possibly oversold
        return BUY

    else:
      // possible weak downward short term momentum with short term increasing faster than long term
      
      if shortTermThreshold == positive insignificant:
        // deviation from mean shows possibly overbought
        return SELL

  if longTermTrend < 0 && shortTermTrend >= 0:
    // indicates slowing decay

    if ABS_VALUE | longTermTrend | > shortTermTrend:
      // possible increasing downward momentum with long term increasing faster than short term
     
      if longTermThreshold >= positive insignificant:
        // deviation from mean shows possibly overbought
        return SELL
    
    else:
      // possible weak upward momentum with short term increasing faster than long term

      if shortTermThreshold == oversold && longTermThreshold >= negative insignificant:
        // deviation from mean shows possibly oversold
        return BUY

  if longTermTrend < 0 && shortTermTrend < 0:
    // indicates increasing decay

    if ABS_VALUE | longTermTrend | > shortTermTrend:
      // possible slowing downward with long term increasing faster than short term

      if shortTermThreshold == overbought && longTermThreshold != oversold:
        // deviation from mean shows possibly overbought
        return SELL

      if shortTermThreshold == oversold:
        // deviation from mean shows possibly oversold
        return 'BUY';
    
    else:
      // possible strong downward momentum with short term increasing faster than long term

      if longTermThreshold == overbought:
        // deviation from mean shows possibly overbought
        return SELL

  return 'NOOP' if none of the above filters are satisfied
```


### Handling Live Data

Selected asset will be continuously listened on for updated data:
```
func price_listener(asset):
  for price of incoming prices until asset is removed:
    shortTermEMA, longTermEMA = calculate ema for short and long terms
    shortTermTrend, longTermTrend = calculate trend for short and long terms
    shortTermSTD, longTermSTD = calculate trend for short and long terms
    shortTermZScore, longTermZScore = calculate z-scores for short and long terms

    signal = generate_signal(
      price, 
      shortTermEMA,
      longTermEMA,
      shortTermTrend,
      longTermTrend,
      shortTermZScore,
      longTermZScore
    )

    ...handle signal separately
```