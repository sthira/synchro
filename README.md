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
```

## Usage

Demo smart contracts with registry included in the project directory.

Prepare demo project build

```bash
git clone ...
cd synchro
forge build
```

Copy demo artifacts into registry

```bash
forge build
synchro copy -f forge -s ./demo/registry/test -a ./demo/out/demo.sol/Demo.json -n demo01
forge clean
```

Prepare contracts and config

Copy a contract `demo-bsep-def` config from `drafts` to `active` within the `contracts` section of `state.json`
`run` command will make the necessary changes on-chain

```bash
export RUN_PRIVATE_KEY="private-key"
synchro run -s ./demo/registry/test
```
