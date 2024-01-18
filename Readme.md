# SOLT

### An Algorithmic Trading Bot For Solana Ecosystem


## Overview

`SOLT` is an algorithmic trading bot designed to automate the trading process of `Solana` specific ecosystem tokens.

To learn more about the design and algorithm chosen, check [Design](./docs/Design.md).


## Setup

**Ensure that the following are installed on target machine**

`docker` - install the latest docker-desktop for mac/windows [here](https://www.docker.com/products/docker-desktop/).
`nodejs` - install the latest node.js [here](https://nodejs.org/en).


### Certs

Run [generateCerts](./generateCerts.sh) to guide through setting up root ca and service certs for solt.
```bash
./generateCerts.sh
```

certs are generated under `~/solt/certs` on the host machine.


### ENV

Export the following to your path:
```bash
export BIRDEYE_API_KEY=<your-birdeye-api-key>
export WALLET_PRIVATE_KEY=<your-solana-wallet-private-key>
source ~/.zshrc
```

Optionally, the following fields can also be added:
```bash
export SELECTED_MODE=<'production' | 'simLive' | 'simHistorical' | 'offline'>
export SELECTED_SIGNAL=<selected-model>
export SELECTED_TIMEFRAME=<'1m' | '5m' | '10m' | '15m' | '1h' | '1d'>
export SELECTED_SHORT_TERM_INTERVAL=<1 | 7>
export SELECTED_LONG_TERM_INTERVAL=<50 | 200>
export TOKEN_ADDRESS=<selected-token-address>
```

If the optional fields are not provided, the constants will resolve to default values:
```ts
const SELECTED_MODE: TraderMode = 'simHistorical'
const SELECTED_SIGNAL_GENERATOR: SignalGenerator = 'hybridtrend'
const SELECTED_TIMEFRAME: Timeframe = '5m';
const SELECTED_SHORT_TERM_INTERVAL: ShortTermInterval = 7;
const SELECTED_LONG_TERM_INTERVAL: LongTermInterval = 50;
const TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112'; // address for SOL token
```

Restart your terminal for the changes to take effect.

**Birdeye subscription needs to be premium to access utilized websocket and https endpoints**

If needed, `@sirgallo` can be contacted and a key can be generated.


### Deployment

In the `root` of the project, first build `Dockerfile.buildapi`, which creates a nodejs preimage shared between the different services:
```bash
./buildpreimages.sh
```

Then, to run a development cluster, deploy using docker through [startupDev](./startupDev.sh):
```bash
./startupDev.sh
```

This will bind each `etcd` member's data directory to `~/solt/etcd<member-number>`. The bound data will persist through restarts and can be analyzed using `bbolt` command line tool.

To stop the services, run:
```bash
./stopDev.sh
```