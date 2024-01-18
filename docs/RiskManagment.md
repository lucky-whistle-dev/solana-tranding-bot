# Risk Management


### A dynamic approach to determining how to handle signals


## Design


### The Audit Trail

Every action made in the system is appended the audit trail. The audit trail contains both the action and the overall performance at the point in time of creation of the entry. Using this timeseries data, the service will perform postprocessing on the results and determine changes that need to be made to either model parameters or overall tolerance to taking on risk. The post processor will launch a watcher instance on the keys prefixed specifically within the audit collection with trader actions, which include:
```ts
export type TraderAction = 'live' | 'livesim' | 'historicalsim';
```

The `live` action contains payloads of operations on the production mainnet, while the other two are for backtesting. `livesim` is for trading on live trading, but creating dummy transactions. `historicalsim` will run a simulation on historical data alone within a range.

For a trader action event, the payload of the result has the following structure:
```ts
interface TokenMetadata {
  token: TokenAddress;
  balance: number;
  balanceChange: number;
  normalizedPrice: number;
}

interface TraderActionPayload {
  fromToken: TokenMetadata;
  toToken: TokenMetadata;
  fee: number;
  slippage: number;
  realizedChange: number;
  timestamp: ISODateString;
}
```

On token swaps, the audit entries focus solely on account balance updates and the price of the asset at the time of the transaction. This simplifies the audits and by focusing balance changes, realized profit/loss can then be computed in the post processing step of the data pipeline.

The `postprocessor` service opens up event separate listeners on the the audit keys prefixed with:
```ts
type TradeActions = `audit/${'live' | 'livesim' | 'historicalsim'}`;
```

On receiving these filtered events, the postprocessor updates the global profile performance, with the following inferred structure
```ts
type __confidenceLevels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PerformanceProfile = InferType<
  InferType<{
    v: number
    successRate: number;
    performanceTrend: number;
    totalTrades: number;
    confidence: __confidenceLevels;
    targetGain: number;
    maxLoss: number;
    profileBalance: { inital: number, current: number };
    realizedProfit: number;
    updatedAt: ISODateString;
  }, 'REQUIRE ALL'> 
  & InferType<{
    [K in TokenAddress]: {
      balance: number,
      aggregatedTotalCost: number;
      realizedProfit: number;
      averagePriceBought: number;
      trades: { success: number, loss: number, };
      totalTrades: number;
      zScoreThresholds: { upper: number, lower: number };
      updatedAt: ISODateString
    }
  }, 'PARTIAL'>>;
```

Since values in `etcd` are stored as buffers, the object is separated under a shared prefix, following this heirarchy:
```
performance/overview | performance/account
```

The entire structure can be rebuilt by performing a range query on the above prefixes and performing a transform/reduce on the combined objects.

When receiving trade audit events:
```
on incoming audit from watcher:
  extract the accounts involved in the transaction and query their performance entries along with the main profile entry fields

  for account of involved accounts;
    if increase in balance:
      calculate the average cost of the asset using previous average, price purchased at, total cost spent, total trades, and total balance of asset

    if decrease in balance:
      calculate the realized profit, the total change in balance

      if the trade resulted in a realized profit, update the total successful trades
      else update the total lost trades for that asset

  Determine the total realized profit for the swap between the account balance changes and the fee included with the transaction

  The current profile balance is then updated an the success rate is updated
```