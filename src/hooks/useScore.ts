import { useState, useEffect, useCallback } from "react";
import fetchUserScore from "@/services/scoreService";

interface UserScoreData {
  address: string;
  username: string;
  totalScore: number;
  breakdown: {
    badgeScore: number;
    socialScore: number;
    streakScore: number;
    chainScore: number;
    contributionScore: number;
  };
  rank: number;
  badges: Array<{ tokenId: number; [key: string]: any }>;
  socialAccounts: Array<{ platform: string; accountId: string }>;
  streakDays: number;
  lastUpdated: number;
}

interface UseScoreResult {
  score: UserScoreData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useScore = (walletAddress: string | null): UseScoreResult => {
  const [score, setScore] = useState<UserScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchUserScore(walletAddress);
      setScore(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    loading,
    error,
    refetch: fetchScore,
  };
};
