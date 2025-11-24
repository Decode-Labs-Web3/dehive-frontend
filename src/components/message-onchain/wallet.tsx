"use client";

import { sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { injected } from "wagmi/connectors";
import { WagmiProvider, http, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

const wcProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "";
if (!wcProjectId && typeof window !== "undefined") {
  // console.warn(
  //   "WalletConnect projectId missing. Injected wallets still work, but some WC features will be disabled. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to remove this warning."
  // );
}
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!;

// If projectId available: use RainbowKit default (WalletConnect enabled)
// Else: fall back to a minimal wagmi config with only injected connector (no calls to web3modal API)
const config = wcProjectId
  ? getDefaultConfig({
      appName: "Dehive Chat",
      projectId: wcProjectId,
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(SEPOLIA_RPC_URL, {
          retryCount: 1,
          timeout: 15_000,
        }),
      },
    })
  : createConfig({
      chains: [sepolia],
      connectors: [injected()],
      transports: {
        [sepolia.id]: http(SEPOLIA_RPC_URL, {
          retryCount: 1,
          timeout: 15_000,
        }),
      },
      ssr: true,
    });

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
