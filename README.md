# Chain Sync

Chain Sync CLI Tool

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
chainsync sync -f ./registry/global/state.json
```
