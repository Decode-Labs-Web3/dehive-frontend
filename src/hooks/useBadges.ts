import { useState, useEffect, useCallback } from "react";
import fetchUserBadges from "@/services/badgeService";

interface UserBadge {
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  imageUrl: string;
}

interface UseBadgesResult {
  badges: UserBadge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBadges = (walletAddress: string | null): UseBadgesResult => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchUserBadges(walletAddress);
      setBadges(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch badges");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
  };
};
