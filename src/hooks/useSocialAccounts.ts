import { useState, useEffect, useCallback } from "react";
import fetchSocialAccounts from "@/services/socialAccountsService";

interface SocialAccount {
  platform: string;
  accountId: string;
}

interface UseSocialAccountsResult {
  socialAccounts: SocialAccount[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSocialAccounts = (
  walletAddress: string | null
): UseSocialAccountsResult => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchSocialAccounts(walletAddress);
      setSocialAccounts(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch social accounts"
      );
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    socialAccounts,
    loading,
    error,
    refetch: fetchAccounts,
  };
};
