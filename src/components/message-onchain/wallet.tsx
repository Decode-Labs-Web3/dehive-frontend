// wallet.tsx
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
  WagmiProvider,
  http,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

// IMPORTANT: thay cái projectId này bằng projectId WalletConnect của bạn.
// Tạm thời cứ để chuỗi giả "YOUR_WALLETCONNECT_PROJECT_ID"
// (bạn có thể tạo free ở cloud.walletconnect.com).
const config = getDefaultConfig({
  appName: 'Dehive Chat',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      // RPC Sepolia public. Bạn có thể thay bằng RPC riêng nếu muốn.
      'https://eth-sepolia.public.blastapi.io'
    ),
  },
});

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
