"use client";

import { useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import AirdropCampaignList from "./AirdropCampaignList";
import CreateAirdropModal from "./CreateAirdropModal";
import { GRAPH_CONFIG, IPFS_GATEWAY } from "@/constants/airdrop.constants";

interface Campaign {
  id: string;
  factory: {
    id: string;
    serverId: string;
    owner: string;
    creator: string;
  };
  serverId: string;
  creator: string;
  token: string;
  merkleRoot: string;
  metadataURI: string;
  totalAmount: string;
  claimedAmount: string;
  createdAt: string;
  blockNumber: string;
  claims: Array<{
    id: string;
    user: string;
    index: string;
    amount: string;
    blockTimestamp: string;
    transactionHash: string;
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

interface CampaignWithMetadata extends Campaign {
  metadata?: CampaignMetadata;
  campaignName?: string;
}

interface GraphResponse {
  data?: {
    campaigns: Campaign[];
  };
  errors?: Array<{ message: string }>;
}

export default function AirdropDropdown({ serverId }: { serverId: string }) {
  const [open, setOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [campaignsWithMetadata, setCampaignsWithMetadata] = useState<
    CampaignWithMetadata[]
  >([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<
    CampaignWithMetadata[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch IPFS metadata for campaigns to enable name search
  const fetchCampaignMetadata = useCallback(
    async (campaignsToFetch: Campaign[]) => {
      if (campaignsToFetch.length === 0) {
        setCampaignsWithMetadata([]);
        setFilteredCampaigns([]);
        return;
      }
      setMetadataLoading(true);
      try {
        console.log("=== Fetching Campaign Metadata ===");
        console.log(
          "Campaigns to fetch metadata for:",
          campaignsToFetch.length
        );

        const campaignsWithMetadataPromises = campaignsToFetch.map(
          async (campaign) => {
            try {
              const ipfsHash = campaign.metadataURI.replace("ipfs://", "");
              console.log(
                `Fetching metadata for campaign ${campaign.id} from IPFS: ${ipfsHash}`
              );

              const metadataResponse = await fetch(
                `${IPFS_GATEWAY}/${ipfsHash}`
              );
              if (!metadataResponse.ok) {
                console.error(
                  `Failed to fetch metadata for ${campaign.id}:`,
                  metadataResponse.status
                );
                return {
                  ...campaign,
                  campaignName: undefined,
                } as CampaignWithMetadata;
              }

              const metadata: CampaignMetadata = await metadataResponse.json();
              console.log(`Metadata fetched for campaign ${campaign.id}:`, {
                name: metadata.metadata.name,
                description: metadata.metadata.description,
              });

              return {
                ...campaign,
                metadata,
                campaignName: metadata.metadata.name,
              } as CampaignWithMetadata;
            } catch (error) {
              console.error(
                `Failed to fetch metadata for campaign ${campaign.id}:`,
                error
              );
              return {
                ...campaign,
                campaignName: undefined,
              } as CampaignWithMetadata;
            }
          }
        );

        const campaignsWithMetadata = await Promise.all(
          campaignsWithMetadataPromises
        );
        console.log(
          "All metadata fetched:",
          campaignsWithMetadata.map((c) => ({
            id: c.id,
            name: c.campaignName,
            createdAt: c.createdAt,
          }))
        );

        // Sort by createdAt (newest first) - createdAt is a timestamp string
        const sortedCampaigns = [...campaignsWithMetadata].sort((a, b) => {
          const timeA = parseInt(a.createdAt) || 0;
          const timeB = parseInt(b.createdAt) || 0;
          return timeB - timeA; // Descending order (newest first)
        });

        console.log(
          "Sorted campaigns (newest first):",
          sortedCampaigns.map((c) => ({
            id: c.id,
            name: c.campaignName,
            createdAt: c.createdAt,
          }))
        );

        setCampaignsWithMetadata(sortedCampaigns);
        setFilteredCampaigns(sortedCampaigns);
      } catch (error) {
        console.error("Failed to fetch campaign metadata:", error);
        // Still set campaigns without metadata so they can be displayed
        const campaignsWithoutMetadata = campaignsToFetch.map(
          (c) =>
            ({
              ...c,
              campaignName: undefined,
            } as CampaignWithMetadata)
        );
        setCampaignsWithMetadata(campaignsWithoutMetadata);
        setFilteredCampaigns(campaignsWithoutMetadata);
      } finally {
        setMetadataLoading(false);
      }
    },
    []
  );

  // Hash serverId for Graph query
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `
        query GetServerCampaigns($serverId: Bytes!) {
          campaigns(where: { serverId: $serverId }) {
            id
            factory {
              id
              serverId
              owner
              creator
            }
            serverId
            creator
            token
            merkleRoot
            metadataURI
            totalAmount
            claimedAmount
            createdAt
            blockNumber
            claims(orderBy: blockTimestamp, orderDirection: desc) {
              id
              user
              index
              amount
              blockTimestamp
              transactionHash
            }
          }
        }
      `;

      console.log("=== The Graph Query Debug ===");
      console.log("Original serverId:", serverId);
      console.log("serverId (keccak256):", serverId);
      console.log("serverId length:", serverId.length);
      console.log("Query variables:", { serverId: serverId });
      console.log("Graph endpoint:", GRAPH_CONFIG.endpoint);

      const requestBody = {
        query,
        variables: { serverId: serverId },
        operationName: "GetServerCampaigns",
      };
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(GRAPH_CONFIG.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GRAPH_CONFIG.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Graph API error response:", errorText);
        throw new Error(`Graph API error: ${response.status}`);
      }

      const result: GraphResponse = await response.json();
      console.log("Graph response data:", JSON.stringify(result, null, 2));

      if (result.errors) {
        console.error("Graph query errors:", result.errors);
        throw new Error(result.errors[0]?.message || "Graph query failed");
      }

      if (result.data?.campaigns) {
        console.log("Campaigns found:", result.data.campaigns.length);
        result.data.campaigns.forEach((campaign, idx) => {
          console.log(`Campaign ${idx + 1}:`, {
            id: campaign.id,
            serverId: campaign.serverId,
            serverIdType: typeof campaign.serverId,
            serverIdLength: campaign.serverId?.length,
            creator: campaign.creator,
            token: campaign.token,
            metadataURI: campaign.metadataURI,
          });
        });
        // Fetch metadata for all campaigns
        await fetchCampaignMetadata(result.data.campaigns);
      } else {
        console.log("No campaigns found in response");
        setCampaignsWithMetadata([]);
        setFilteredCampaigns([]);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch campaigns"
      );
      setCampaignsWithMetadata([]);
      setFilteredCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [serverId, fetchCampaignMetadata]);

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open, fetchCampaigns]);

  // Filter campaigns by search query (campaign name only)
  useEffect(() => {
    console.log("=== Search Filter Debug ===");
    console.log("Search query:", searchQuery);
    console.log("Eligible only:", eligibleOnly);
    console.log("Total campaigns with metadata:", campaignsWithMetadata.length);
    console.log(
      "Campaigns with names:",
      campaignsWithMetadata.map((c) => ({
        id: c.id,
        name: c.campaignName,
        createdAt: c.createdAt,
      }))
    );

    let filtered = [...campaignsWithMetadata];

    if (searchQuery.trim()) {
      console.log("Filtering by campaign name:", searchQuery);
      // Filter by campaign name only
      filtered = filtered.filter((campaign) => {
        const campaignName = campaign.campaignName || "";
        const matches = campaignName
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
        console.log(`Campaign ${campaign.id} (${campaignName}):`, {
          matches,
          searchQuery: searchQuery.toLowerCase().trim(),
          campaignName: campaignName.toLowerCase(),
        });
        return matches;
      });
      console.log("Filtered campaigns after search:", filtered.length);
    }

    // Sort filtered results by createdAt (newest first) to maintain order
    filtered.sort((a, b) => {
      const timeA = parseInt(a.createdAt) || 0;
      const timeB = parseInt(b.createdAt) || 0;
      return timeB - timeA; // Descending order (newest first)
    });

    // Note: Eligible filter requires checking IPFS metadata for user address
    // This will be handled in AirdropCampaignList component
    console.log(
      "Final filtered campaigns (sorted by newest first):",
      filtered.length
    );
    console.log(
      "Filtered campaigns:",
      filtered.map((c) => ({
        id: c.id,
        name: c.campaignName,
        createdAt: c.createdAt,
      }))
    );
    setFilteredCampaigns(filtered);
  }, [searchQuery, eligibleOnly, campaignsWithMetadata]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <FontAwesomeIcon icon={faGift} className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[500px] p-0" sideOffset={8}>
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGift} className="w-4 h-4" />
                <h3 className="font-semibold">Airdrops</h3>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setCreateModalOpen(true);
                  setOpen(false);
                }}
              >
                Create
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="px-4 py-3 border-b border-border space-y-2">
              <div className="space-y-1">
                <Label htmlFor="airdrop-search" className="text-xs">
                  Search
                </Label>
                <Input
                  id="airdrop-search"
                  placeholder="Search by campaign name..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log("Search input changed:", value);
                    setSearchQuery(value);
                  }}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="eligible-only"
                  checked={eligibleOnly}
                  onCheckedChange={setEligibleOnly}
                />
                <Label
                  htmlFor="eligible-only"
                  className="text-xs cursor-pointer"
                >
                  Eligible only
                </Label>
              </div>
            </div>

            {/* Campaign List */}
            <ScrollArea className="flex-1">
              {loading || metadataLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {loading
                    ? "Loading campaigns..."
                    : "Loading campaign metadata..."}
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-destructive mb-2">{error}</p>
                  <Button size="sm" variant="outline" onClick={fetchCampaigns}>
                    Retry
                  </Button>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={faGift}
                      className="w-8 h-8 text-muted-foreground"
                    />
                  </div>
                  <p className="font-semibold mb-2">No airdrops found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || eligibleOnly
                      ? "Try adjusting your search or filters"
                      : "Create your first airdrop campaign"}
                  </p>
                  {!searchQuery && !eligibleOnly && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setCreateModalOpen(true);
                        setOpen(false);
                      }}
                    >
                      Create Airdrop
                    </Button>
                  )}
                </div>
              ) : (
                <AirdropCampaignList
                  campaigns={filteredCampaigns}
                  serverId={serverId}
                  eligibleOnly={eligibleOnly}
                />
              )}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      <CreateAirdropModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        serverId={serverId}
        onSuccess={() => {
          fetchCampaigns();
          setCreateModalOpen(false);
        }}
      />
    </>
  );
}
