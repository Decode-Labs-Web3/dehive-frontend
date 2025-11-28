"use client";

import { useUser } from "@/hooks/useUser";
import { useDeidProfile } from "@/hooks/useDeidProfile";
import { useScore } from "@/hooks/useScore";
import { useBadges } from "@/hooks/useBadges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function UserDeid() {
  const { user } = useUser();
  const walletAddress = user.primary_wallet?.address || null;
  const {
    profile,
    metadata,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useDeidProfile(walletAddress);
  const {
    score,
    loading: scoreLoading,
    error: scoreError,
    refetch: refetchScore,
  } = useScore(walletAddress);
  const {
    badges,
    loading: badgesLoading,
    error: badgesError,
    refetch: refetchBadges,
  } = useBadges(walletAddress);

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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">DEiD Profile</h2>

      {/* DEiD Profile Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Profile</h3>
        {profileLoading && <p>Loading profile...</p>}
        {profileError && (
          <div>
            <p className="text-red-500">Error: {profileError}</p>
            <Button onClick={refetchProfile} className="mt-2">
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
                <h4 className="font-semibold">Metadata:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        {!profileLoading && !profileError && !profile && (
          <p>No DEiD profile found for this wallet.</p>
        )}
      </Card>

      {/* Trust Score Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Trust Score</h3>
        {scoreLoading && <p>Loading score...</p>}
        {scoreError && (
          <div>
            <p className="text-red-500">Error: {scoreError}</p>
            <Button onClick={refetchScore} className="mt-2">
              Retry
            </Button>
          </div>
        )}
        {score && (
          <div>
            <p>
              <strong>Username:</strong> {score.username}
            </p>
            <p>
              <strong>Total Score:</strong> {score.totalScore}
            </p>
            <p>
              <strong>Rank:</strong> {score.rank}
            </p>
            <p>
              <strong>Streak Days:</strong> {score.streakDays}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(score.lastUpdated * 1000).toLocaleString()}
            </p>
            <div className="mt-4">
              <h4 className="font-semibold">Score Breakdown:</h4>
              <ul className="list-disc list-inside">
                <li>Badge Score: {score.breakdown.badgeScore}</li>
                <li>Social Score: {score.breakdown.socialScore}</li>
                <li>Streak Score: {score.breakdown.streakScore}</li>
                <li>Chain Score: {score.breakdown.chainScore}</li>
                <li>Contribution Score: {score.breakdown.contributionScore}</li>
              </ul>
            </div>
            {score.badges && score.badges.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Badges:</h4>
                <ul className="list-disc list-inside">
                  {score.badges.map((badge, index) => (
                    <li key={index}>Token ID: {badge.tokenId}</li>
                  ))}
                </ul>
              </div>
            )}
            {score.socialAccounts && score.socialAccounts.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Social Accounts:</h4>
                <ul className="list-disc list-inside">
                  {score.socialAccounts.map((account, index) => (
                    <li key={index}>
                      {account.platform}: {account.accountId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {!scoreLoading && !scoreError && !score && (
          <p>No trust score found for this wallet.</p>
        )}
      </Card>

      {/* Badges Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Badges</h3>
        {badgesLoading && <p>Loading badges...</p>}
        {badgesError && (
          <div>
            <p className="text-red-500">Error: {badgesError}</p>
            <Button onClick={refetchBadges} className="mt-2">
              Retry
            </Button>
          </div>
        )}
        {badges && badges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div key={badge.tokenId} className="border rounded-lg p-4">
                <Image
                  src={badge.imageUrl}
                  alt={badge.metadata.name}
                  width={128}
                  height={128}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h4 className="font-semibold">{badge.metadata.name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {badge.metadata.description}
                </p>
                <p className="text-xs text-gray-500">
                  Token ID: {badge.tokenId}
                </p>
                {badge.metadata.attributes &&
                  badge.metadata.attributes.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-sm font-semibold">Attributes:</h5>
                      <ul className="text-xs">
                        {badge.metadata.attributes.map((attr, index) => (
                          <li key={index}>
                            {attr.trait_type}: {attr.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
        {!badgesLoading && !badgesError && badges.length === 0 && (
          <p>No badges found for this wallet.</p>
        )}
      </Card>
    </div>
  );
}
