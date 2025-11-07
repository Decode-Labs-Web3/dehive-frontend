"use client";

import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits, isAddress, getAddress } from "viem";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  IPFS_GATEWAY,
  EXPLORER_BASE_URL,
  merkleAirdropAbi,
} from "@/constants/airdrop.constants";
import { getDaysLeft, shortenAddress } from "@/lib/airdropHelpers";

interface Campaign {
  id: string;
  creator: string;
  token: string;
  metadataURI: string;
  totalAmount: string;
  claimedAmount: string;
  createdAt: string;
  claims: Array<{
    user: string;
    amount: string;
  }>;
}

interface CampaignMetadata {
  metadata: {
    name: string;
    description: string;
    token: string;
    claimDeadline: number;
    totalAmount: string;
  };
  claims: Array<{
    account: string;
    amount: string;
    index: number;
    proof: string[];
  }>;
}

interface CampaignWithData extends Campaign {
  metadata?: CampaignMetadata;
  tokenDecimals?: number;
  tokenSymbol?: string;
  tokenName?: string;
  userClaim?: {
    index: number;
    amount: string;
    proof: string[];
  };
  isClaimed?: boolean;
  daysLeft?: number;
}

export default function AirdropCampaignList({
  campaigns,
  eligibleOnly,
}: {
  campaigns: Campaign[];
  serverId: string;
  eligibleOnly: boolean;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [campaignData, setCampaignData] = useState<
    Map<string, CampaignWithData>
  >(new Map());
  const [claiming, setClaiming] = useState<Map<string, boolean>>(new Map());
  const [claimTxHash, setClaimTxHash] = useState<Map<string, string>>(
    new Map()
  );

  // Fetch IPFS metadata and token info for each campaign
  useEffect(() => {
    console.log("=== AirdropCampaignList: Fetching metadata ===");
    console.log("Campaigns to fetch metadata for:", campaigns.length);
    campaigns.forEach(async (campaign) => {
      try {
        // Fetch IPFS metadata
        const ipfsHash = campaign.metadataURI.replace("ipfs://", "");
        console.log(
          `Fetching metadata for campaign ${campaign.id} from IPFS: ${ipfsHash}`
        );
        const metadataResponse = await fetch(`${IPFS_GATEWAY}/${ipfsHash}`);
        if (!metadataResponse.ok) {
          console.error(
            `Failed to fetch metadata for ${campaign.id}:`,
            metadataResponse.status,
            metadataResponse.statusText
          );
          return;
        }
        const metadata: CampaignMetadata = await metadataResponse.json();
        console.log(`Metadata fetched for campaign ${campaign.id}:`, {
          name: metadata.metadata.name,
          description: metadata.metadata.description,
          token: metadata.metadata.token,
          claimsCount: metadata.claims.length,
        });

        // Fetch token decimals and symbol
        let tokenDecimals = 18; // Default
        let tokenSymbol = "TOKEN";
        let tokenName = "Token";

        if (publicClient && isAddress(campaign.token)) {
          try {
            const [decimals, symbol, name] = await Promise.all([
              publicClient.readContract({
                address: campaign.token as `0x${string}`,
                abi: [
                  {
                    type: "function",
                    stateMutability: "view",
                    name: "decimals",
                    inputs: [],
                    outputs: [{ name: "", type: "uint8" }],
                  },
                ],
                functionName: "decimals",
              }),
              publicClient.readContract({
                address: campaign.token as `0x${string}`,
                abi: [
                  {
                    type: "function",
                    stateMutability: "view",
                    name: "symbol",
                    inputs: [],
                    outputs: [{ name: "", type: "string" }],
                  },
                ],
                functionName: "symbol",
              }),
              publicClient.readContract({
                address: campaign.token as `0x${string}`,
                abi: [
                  {
                    type: "function",
                    stateMutability: "view",
                    name: "name",
                    inputs: [],
                    outputs: [{ name: "", type: "string" }],
                  },
                ],
                functionName: "name",
              }),
            ]);

            tokenDecimals = Number(decimals);
            tokenSymbol = symbol as string;
            tokenName = name as string;
          } catch (error) {
            console.error(
              `Failed to fetch token info for ${campaign.token}:`,
              error
            );
          }
        }

        // Find user's claim if address exists
        let userClaim: CampaignMetadata["claims"][0] | undefined;
        if (address) {
          userClaim = metadata.claims.find(
            (c) =>
              getAddress(c.account.toLowerCase()) ===
              getAddress(address.toLowerCase())
          );
        }

        // Check if already claimed
        let isClaimed = false;
        if (userClaim && publicClient) {
          try {
            isClaimed = (await publicClient.readContract({
              address: campaign.id as `0x${string}`,
              abi: merkleAirdropAbi,
              functionName: "isClaimed",
              args: [BigInt(userClaim.index)],
            })) as boolean;
          } catch (error) {
            console.error(`Failed to check claim status:`, error);
          }
        }

        const daysLeft = getDaysLeft(metadata.metadata.claimDeadline);

        setCampaignData((prev) => {
          const next = new Map(prev);
          next.set(campaign.id, {
            ...campaign,
            metadata,
            tokenDecimals,
            tokenSymbol,
            tokenName,
            userClaim,
            isClaimed,
            daysLeft,
          });
          return next;
        });
      } catch (error) {
        console.error(
          `Failed to fetch data for campaign ${campaign.id}:`,
          error
        );
      }
    });
  }, [campaigns, address, publicClient]);

  // Filter by eligibility if enabled
  const filteredCampaigns = eligibleOnly
    ? campaigns.filter((campaign) => {
        const data = campaignData.get(campaign.id);
        return data?.userClaim && !data.isClaimed && (data.daysLeft ?? 0) > 0;
      })
    : campaigns;

  const handleClaim = async (campaign: CampaignWithData) => {
    if (!address || !campaign.userClaim || !publicClient) return;

    setClaiming((prev) => {
      const next = new Map(prev);
      next.set(campaign.id, true);
      return next;
    });

    try {
      const txHash = await writeContractAsync({
        address: campaign.id as `0x${string}`,
        abi: merkleAirdropAbi,
        functionName: "claim",
        args: [
          BigInt(campaign.userClaim!.index),
          address as `0x${string}`,
          BigInt(campaign.userClaim!.amount),
          campaign.userClaim!.proof as `0x${string}`[],
        ],
      });

      setClaimTxHash((prev) => {
        const next = new Map(prev);
        next.set(campaign.id, txHash);
        return next;
      });

      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Update claim status
      setCampaignData((prev) => {
        const next = new Map(prev);
        const data = next.get(campaign.id);
        if (data) {
          next.set(campaign.id, { ...data, isClaimed: true });
        }
        return next;
      });
    } catch (error) {
      console.error("Claim failed:", error);
    } finally {
      setClaiming((prev) => {
        const next = new Map(prev);
        next.set(campaign.id, false);
        return next;
      });
    }
  };

  if (filteredCampaigns.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {eligibleOnly
          ? "No eligible airdrops found"
          : "No campaigns to display"}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {filteredCampaigns.map((campaign) => {
        const data = campaignData.get(campaign.id);
        if (!data || !data.metadata) {
          return (
            <Card key={campaign.id} className="border-border">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Loading campaign data...
                </div>
              </CardContent>
            </Card>
          );
        }

        const totalAmount = formatUnits(
          BigInt(data.totalAmount),
          data.tokenDecimals || 18
        );
        const recipientCount = data.metadata.claims.length;
        const canClaim =
          data.userClaim && !data.isClaimed && (data.daysLeft ?? 0) > 0;
        const isClaiming = claiming.get(campaign.id) || false;
        const txHash = claimTxHash.get(campaign.id);

        return (
          <Card key={campaign.id} className="border-border">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {data.metadata.metadata.name || "Unnamed Campaign"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    by {shortenAddress(data.creator)}
                  </p>
                </div>
                <a
                  href={`${EXPLORER_BASE_URL}/address/${campaign.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Description */}
              {data.metadata.metadata.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {data.metadata.metadata.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium">
                    {parseFloat(totalAmount).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {data.tokenSymbol}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Recipients: </span>
                  <span className="font-medium">{recipientCount}</span>
                </div>
                {data.daysLeft !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Days left: </span>
                    <span className="font-medium">{data.daysLeft}</span>
                  </div>
                )}
              </div>

              {/* User Claim Info */}
              {data.userClaim && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Your claim:
                    </span>
                    <Badge variant="secondary">
                      {formatUnits(
                        BigInt(data.userClaim.amount),
                        data.tokenDecimals || 18
                      )}{" "}
                      {data.tokenSymbol}
                    </Badge>
                  </div>
                  {canClaim ? (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleClaim(data)}
                      disabled={isClaiming}
                    >
                      {isClaiming ? "Claiming..." : "Claim"}
                    </Button>
                  ) : data.isClaimed ? (
                    <Badge variant="outline" className="w-full justify-center">
                      Already Claimed
                    </Badge>
                  ) : data.daysLeft === 0 ? (
                    <Badge variant="outline" className="w-full justify-center">
                      Expired
                    </Badge>
                  ) : null}
                  {txHash && (
                    <a
                      href={`${EXPLORER_BASE_URL}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground mt-1 block"
                    >
                      View transaction →
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
