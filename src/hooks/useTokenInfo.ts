import { erc20Abi } from "@/abi/airdropAbi";
import { type Address, isAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

export function useTokenInfo(tokenAddress: Address | undefined) {
  const { address: userAddress } = useAccount();

  const {
    data: name,
    isLoading: nameLoading,
    error: nameError,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: !!tokenAddress && isAddress(tokenAddress),
    },
  });

  const {
    data: symbol,
    isLoading: symbolLoading,
    error: symbolError,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress && isAddress(tokenAddress),
    },
  });

  const {
    data: decimals,
    isLoading: decimalsLoading,
    error: decimalsError,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress && isAddress(tokenAddress),
    },
  });

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!tokenAddress && isAddress(tokenAddress) && !!userAddress,
    },
  });

  const isLoading = nameLoading || symbolLoading || decimalsLoading;
  const hasError = nameError || symbolError || decimalsError;

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    balance: balance as bigint | undefined,
    isLoading,
    hasError,
  };
}
