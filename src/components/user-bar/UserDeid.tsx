"use client";

import { useUser } from "@/hooks/useUser";
import { useDeidProfile } from "@/hooks/useDeidProfile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserDeid() {
  const { user } = useUser();
  const walletAddress = user.primary_wallet?.address || null;
  const { profile, metadata, loading, error, refetch } =
    useDeidProfile(walletAddress);

  if (!walletAddress) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">DEiD Profile</h2>
        <p>
          No wallet connected. Please connect a wallet to view your DEiD
          profile.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">DEiD Profile</h2>
      <Card className="p-4">
        {loading && <p>Loading profile...</p>}
        {error && (
          <div>
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={refetch} className="mt-2">
              Retry
            </Button>
          </div>
        )}
        {profile && (
          <div>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Wallets:</strong> {profile.wallets.join(", ")}
            </p>
            <p>
              <strong>Social Accounts:</strong>{" "}
              {profile.socialAccounts.join(", ")}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(profile.createdAt * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(profile.lastUpdated * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Active:</strong> {profile.isActive ? "Yes" : "No"}
            </p>
            {metadata && (
              <div className="mt-4">
                <h3 className="font-semibold">Metadata:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        {!loading && !error && !profile && (
          <p>No DEiD profile found for this wallet.</p>
        )}
      </Card>
    </div>
  );
}
