# Synchro

deploy and configure smart contracts by editing state files

## Installation and Setup

```bash
npm install
npm run build && npm link
```

Setup environment variables

```bash
export RUN_PRIVATE_KEY=<your private key>
export RUN_ALCHEMY_API_KEY=<your alchemy api key>
```

## Usage

```bash
cd game-wallet
synchro run -s ./registry/global
```
