"use client";

import { useUser } from "@/hooks/useUser";
import { useDeidProfile } from "@/hooks/useDeidProfile";
import { useScore } from "@/hooks/useScore";
import { useBadges } from "@/hooks/useBadges";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  faUser,
  faShield,
  faAward,
  faUsers,
  faGlobe,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  const {
    socialAccounts,
    loading: socialAccountsLoading,
    error: socialAccountsError,
    refetch: refetchSocialAccounts,
  } = useSocialAccounts(walletAddress);

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faUser}
              className="w-16 h-16 mx-auto mb-4 text-primary"
            />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              DEiD Profile
            </h2>
            <p className="text-muted-foreground">
              No wallet connected. Please connect a wallet to view your DEiD
              profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faUser}
            className="w-16 h-16 mx-auto mb-4 text-primary"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">
            DEiD Profile
          </h1>
          <p className="text-muted-foreground">
            Your Decentralized Identity Dashboard
          </p>
        </div>

        {/* DEiD Profile Section */}
        <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon
              icon={faUser}
              className="w-6 h-6 text-primary mr-3"
            />
            <h3 className="text-2xl font-semibold text-foreground">Profile</h3>
          </div>
          {profileLoading && (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faRefresh}
                className="w-8 h-8 animate-spin text-primary"
              />
              <span className="ml-2 text-muted-foreground">
                Loading profile...
              </span>
            </div>
          )}
          {profileError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: {profileError}</p>
              <Button
                onClick={refetchProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Retry
              </Button>
            </div>
          )}
          {profile && (
            <div className="space-y-6">
              {metadata?.avatar_ipfs_hash && (
                <div className="flex justify-center">
                  <Image
                    src={`https://ipfs.io/ipfs/${metadata.avatar_ipfs_hash}`}
                    alt="Profile Avatar"
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Username:
                    </span>
                    <span className="text-foreground">
                      {metadata?.username || profile.username}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Display Name:
                    </span>
                    <span className="text-foreground">
                      {metadata?.display_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Primary Wallet:
                    </span>
                    <span className="text-foreground text-sm font-mono">
                      {metadata?.primary_wallet?.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Decode User ID:
                    </span>
                    <span className="text-foreground text-sm font-mono">
                      {metadata?.decode_user_id || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Created At:
                    </span>
                    <span className="text-foreground">
                      {new Date(profile.createdAt * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Last Updated:
                    </span>
                    <span className="text-foreground">
                      {new Date(profile.lastUpdated * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Active:
                    </span>
                    <span
                      className={`font-semibold ${
                        profile.isActive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {profile.isActive ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-muted-foreground w-32">
                      Wallets:
                    </span>
                    <span className="text-foreground">
                      {profile.wallets.length}
                    </span>
                  </div>
                </div>
              </div>
              {metadata?.bio && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Bio:</h4>
                  <p className="text-foreground bg-muted p-4 rounded-lg border border-border">
                    {metadata.bio}
                  </p>
                </div>
              )}
              {metadata?.wallets && metadata.wallets.length > 1 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    All Wallets:
                  </h4>
                  <div className="space-y-2">
                    {metadata.wallets.map((wallet: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border"
                      >
                        <span className="text-sm font-mono text-foreground">
                          {wallet.address}
                        </span>
                        {wallet.is_primary && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/30">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!profileLoading && !profileError && !profile && (
            <p className="text-center py-8 text-muted-foreground">
              No DEiD profile found for this wallet.
            </p>
          )}
        </Card>

        {/* Trust Score Section */}
        <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon
              icon={faShield}
              className="w-6 h-6 text-success mr-3"
            />
            <h3 className="text-2xl font-semibold text-foreground">
              Trust Score
            </h3>
          </div>
          {scoreLoading && (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faRefresh}
                className="w-8 h-8 animate-spin text-success"
              />
              <span className="ml-2 text-muted-foreground">
                Loading score...
              </span>
            </div>
          )}
          {scoreError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: {scoreError}</p>
              <Button
                onClick={refetchScore}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                Retry
              </Button>
            </div>
          )}
          {score && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-success mb-2">
                  {score.totalScore}
                </div>
                <p className="text-muted-foreground">Total Trust Score</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">
                    {score.rank}
                  </div>
                  <p className="text-muted-foreground">Rank</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">
                    {score.streakDays}
                  </div>
                  <p className="text-muted-foreground">Streak Days</p>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Last Updated:{" "}
                    {new Date(score.lastUpdated * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">
                  Score Breakdown
                </h4>
                <div className="space-y-3">
                  {Object.entries(score.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="w-32 text-sm font-medium text-muted-foreground capitalize">
                        {key.replace("Score", "")}:
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-2 mr-2 border border-border">
                        <div
                          className="bg-success h-2 rounded-full"
                          style={{
                            width: `${Math.min((value / 100) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-foreground w-12 text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {score.badges && score.badges.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {score.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs border border-warning/30"
                      >
                        Token ID: {badge.tokenId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {score.socialAccounts && score.socialAccounts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Social Accounts
                  </h4>
                  <div className="space-y-2">
                    {score.socialAccounts.map((account, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
                        <span className="text-foreground">
                          {account.platform}: {account.accountId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!scoreLoading && !scoreError && !score && (
            <p className="text-center py-8 text-muted-foreground">
              No trust score found for this wallet.
            </p>
          )}
        </Card>

        {/* Badges Section */}
        <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon
              icon={faAward}
              className="w-6 h-6 text-warning mr-3"
            />
            <h3 className="text-2xl font-semibold text-foreground">Badges</h3>
          </div>
          {badgesLoading && (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faRefresh}
                className="w-8 h-8 animate-spin text-warning"
              />
              <span className="ml-2 text-muted-foreground">
                Loading badges...
              </span>
            </div>
          )}
          {badgesError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: {badgesError}</p>
              <Button
                onClick={refetchBadges}
                className="bg-warning hover:bg-warning/90 text-warning-foreground"
              >
                Retry
              </Button>
            </div>
          )}
          {badges && badges.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.tokenId}
                  className="bg-gradient-to-br from-warning/10 to-warning/20 border border-warning/30 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={badge.imageUrl}
                    alt={badge.metadata.name}
                    width={128}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-foreground mb-2">
                    {badge.metadata.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.metadata.description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Token ID: {badge.tokenId}
                  </p>
                  {badge.metadata.attributes &&
                    badge.metadata.attributes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-1">
                          Attributes:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {badge.metadata.attributes.map((attr, index) => (
                            <span
                              key={index}
                              className="bg-warning/20 text-warning px-2 py-1 rounded text-xs border border-warning/30"
                            >
                              {attr.trait_type}: {attr.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
          {!badgesLoading && !badgesError && badges.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No badges found for this wallet.
            </p>
          )}
        </Card>

        {/* Social Accounts Section */}
        <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-6 h-6 text-info mr-3"
            />
            <h3 className="text-2xl font-semibold text-foreground">
              Social Accounts
            </h3>
          </div>
          {socialAccountsLoading && (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faRefresh}
                className="w-8 h-8 animate-spin text-info"
              />
              <span className="ml-2 text-muted-foreground">
                Loading social accounts...
              </span>
            </div>
          )}
          {socialAccountsError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: {socialAccountsError}</p>
              <Button
                onClick={refetchSocialAccounts}
                className="bg-info hover:bg-info/90 text-info-foreground"
              >
                Retry
              </Button>
            </div>
          )}
          {socialAccounts && socialAccounts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialAccounts.map((account, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-info/10 to-primary/10 border border-info/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center text-info">
                      <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {account.platform}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountId}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!socialAccountsLoading &&
            !socialAccountsError &&
            socialAccounts.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No social accounts linked to this wallet.
              </p>
            )}
        </Card>
      </div>
    </div>
  );
}
