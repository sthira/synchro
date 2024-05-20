import { defineChain, createWalletClient, publicActions, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function setupClient(networks: any[], contract: any, account: any) {
  const chainInfo = networks.find(
    (net: any) => net.network === contract.network_name
  );
  if (!chainInfo) {
    console.error(`Network details for ${contract.network_name} not found.`);
    return null;
  }

  const chainConfig = defineChain({
    id: chainInfo.chainId,
    name: chainInfo.name,
    network: chainInfo.network,
    nativeCurrency: {
      decimals: chainInfo.currencyDecimals,
      name: chainInfo.currencyName,
      symbol: chainInfo.currencySymbol,
    },
    rpcUrls: {
      default: {
        http: [chainInfo.rpcUrlHTTP],
        webSocket: [chainInfo.rpcUrlWS],
      },
      public: {
        http: [chainInfo.rpcUrlHTTP],
        webSocket: [chainInfo.rpcUrlWS],
      },
    },
    blockExplorers: {
      default: {
        name: "Explorer",
        url: chainInfo.blockExplorer,
      },
    },
  });

  return createWalletClient({
    account: account,
    chain: chainConfig,
    transport: http(),
  }).extend(publicActions);
}
