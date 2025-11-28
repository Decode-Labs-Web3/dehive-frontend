import { useState, useEffect, useCallback } from "react";
import fetchUserProfile from "@/services/deidProfile";

interface DeidProfile {
  username: string;
  metadataURI: string;
  wallets: string[];
  socialAccounts: string[];
  createdAt: number;
  lastUpdated: number;
  isActive: boolean;
}

interface Metadata {
  [key: string]: any;
}

interface UseDeidProfileResult {
  profile: DeidProfile | null;
  metadata: Metadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDeidProfile = (
  walletAddress: string | null
): UseDeidProfileResult => {
  const [profile, setProfile] = useState<DeidProfile | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchUserProfile(walletAddress);
      setProfile(result.profile);
      setMetadata(result.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    metadata,
    loading,
    error,
    refetch: fetchProfile,
  };
};
