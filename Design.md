# SOLT


## Computation


### Overview

`SOLT` utilizes a hybrid [mean reversion](https://en.wikipedia.org/wiki/Mean_reversion_(finance)).


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


### Algorithm

**NOTE**
```
for short term trend --> 7 day EMA
for long term trend --> 50 day EMA
```

`The following pseudocode outlines trading a selected asset.`

To handle execution of orders:
```
func execute_order(asset, price, ema7, ema50, trend7, trend50, targetGain, maxLoss):
  if trend50 > 0 && trend7 > 0:
    // indicates strong upward momentum

    if asset is owned:
      if trend7 < trend50 && price deviates above mean:
        // the 50 day trend rate of change is increasing faster than the 7 day trend rate of change
        if price > asset buy price && (price - asset buy price) / 100 = targetGain:
          // target gain has been achieved 
          sell all
        else:
          reduce holding
  
  if trend50 > 0 && trend7 < 0:
    // indicates weak upward momentum

    if asset is owned:
      else if ABS_VALUE | trend7 | < trend50 && price deviates below mean:
        // the 7 day trend rate of change is increasing faster than the 50 day trend rate of change
        buy
      else:
        if price > asset buy price && (price - asset buy price) / 100 = targetGain:
          // target gain has been achieved
          sell all
        else:
          reduce holding
    else:
      if ABS_VALUE | trend7 | < trend50 && price deviates below mean:
        // the 7 day trend rate of change is increasing faster than the 50 day trend rate of change
        buy
  
  if trend50 < 0 && trend7 > 0:
    // indicates weak downward momentum

    if asset is owned:
      if ABS_VALUE | trend50 | > trend7 && price deviates over mean:
        // the 50 day trend rate of change is increasing faster than the 7 day trend rate of change
        
        if price < asset buy price && (asset buy price - price) / 100 = maxLoss:
          // stop loss has been reached
          sell all
        else:
          reduce holding
      else if ABS_VALUE | trend50 | < trend7 && price deviates under mean:
        buy
  
  if trend50 < 0 && trend7 < 0:
    // indicates strong downward momentum

    if asset is owned:
      if price < asset buy price && (asset buy price - price) / 100 = maxLoss:
        // stop loss has been reached
        sell all
      else:
        reduce holding
```

The below algorithm will use a continuous stream of data for a particular asset:
```
func price_listener(asset):
  for price of incoming prices until asset is removed:
    { ema7, ema50 } = calculate ema for 7 and 50 day
    { trend7, trend50 } = calculate trend for 7 and 50 day

    execute_order(asset, price, ema7, ema50, trend7, trend50)

  finally when removed return
```