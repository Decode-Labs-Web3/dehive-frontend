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
import { keccak256, stringToBytes } from "viem";
import { GRAPH_CONFIG } from "@/constants/airdrop.constants";

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

interface GraphResponse {
  data?: {
    campaigns: Campaign[];
  };
  errors?: Array<{ message: string }>;
}

export default function AirdropDropdown({ serverId }: { serverId: string }) {
  const [open, setOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hash serverId for Graph query
  const serverIdHash = keccak256(stringToBytes(serverId));

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

      const response = await fetch(GRAPH_CONFIG.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GRAPH_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          query,
          variables: { serverId: serverIdHash },
          operationName: "GetServerCampaigns",
        }),
      });

      if (!response.ok) {
        throw new Error(`Graph API error: ${response.status}`);
      }

      const result: GraphResponse = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Graph query failed");
      }

      if (result.data?.campaigns) {
        setCampaigns(result.data.campaigns);
        setFilteredCampaigns(result.data.campaigns);
      } else {
        setCampaigns([]);
        setFilteredCampaigns([]);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch campaigns"
      );
      setCampaigns([]);
      setFilteredCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [serverIdHash]);

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open, fetchCampaigns]);

  // Filter campaigns by search query
  useEffect(() => {
    let filtered = [...campaigns];

    if (searchQuery) {
      // Filter by campaign ID or creator address
      filtered = filtered.filter(
        (campaign) =>
          campaign.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Note: Eligible filter requires checking IPFS metadata for user address
    // This will be handled in AirdropCampaignList component
    setFilteredCampaigns(filtered);
  }, [searchQuery, eligibleOnly, campaigns]);

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
                  placeholder="Search by address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading campaigns...
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
