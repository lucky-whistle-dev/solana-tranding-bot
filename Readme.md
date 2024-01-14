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

Restart your terminal for the changes to take effect.

**Birdeye subscription needs to be premium to access utilized websocket and https endpoints**

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