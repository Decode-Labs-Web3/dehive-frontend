// wallet.tsx
"use client";

import { sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { injected, walletConnect } from "wagmi/connectors";
import { WagmiProvider, createConfig } from "wagmi";
import { http, fallback as viemFallback } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

// WalletConnect projectId: tạo ở cloud.walletconnect.com, set vào env NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const wcProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "";
if (!wcProjectId && typeof window !== "undefined") {
  // console.warn(
  //   "WalletConnect projectId missing. Injected wallets still work, but some WC features will be disabled. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to remove this warning."
  // );
}
// Build connectors explicitly to avoid bundling MetaMask SDK via RainbowKit defaults
const connectors = wcProjectId
  ? [
      injected(),
      walletConnect({
        projectId: wcProjectId,
        metadata: {
          name: "Dehive Chat",
          description: "Dehive Chat dApp",
          url:
            typeof window !== "undefined"
              ? window.location.origin
              : "https://dehive.app",
          icons: ["https://dehive.app/icon.png"],
        },
        showQrModal: true,
      }),
    ]
  : [injected()];

// Build robust fallback transports to avoid single RPC quota limits
const sepoliaRpcUrls = (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Sensible public defaults (ordered by reliability); override via env when possible
const defaultSepoliaRpcUrls = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.ankr.com/eth_sepolia",
  "https://1rpc.io/sepolia",
];
const sepoliaTransports = viemFallback(
  (sepoliaRpcUrls.length ? sepoliaRpcUrls : defaultSepoliaRpcUrls).map((u) =>
    http(u)
  )
);

const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: sepoliaTransports,
  },
  batch: { multicall: false },
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
