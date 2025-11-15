"use client";

import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useServersList } from "@/hooks/useServersList";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  faCoins,
  faNetworkWired,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NFTInfoProps {
  enabled: boolean;
  network: string;
  contract_address: string;
  required_balance: number;
}

export default function ServerNFT() {
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [isNFT, setIsNFT] = useState<boolean>(false);
  const { serverId } = useParams<{ serverId: string }>();
  const [statusNFT, setStatusNFT] = useState<boolean>(false);
  const { updateServerNFTGatingList } = useServersList();
  const { serverInfomation, updateServerNFTInformation } =
    useServerInfomation();
  const [originalNftInfo, setOriginalNftInfo] = useState<NFTInfoProps | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    if (serverInfomation.nft_gated) {
      setOriginalNftInfo({
        enabled: serverInfomation.nft_gated.enabled,
        network: serverInfomation.nft_gated.network,
        contract_address: serverInfomation.nft_gated.contract_address,
        required_balance: serverInfomation.nft_gated.required_balance,
      });
      setIsNFT(true);
      setStatusNFT(serverInfomation.nft_gated.enabled);
      return;
    }
    setIsNFT(false);
  }, [serverInfomation.nft_gated]);
  const [nftInfo, setNftInfo] = useState<NFTInfoProps>({
    enabled: serverInfomation.nft_gated?.enabled || false,
    network: serverInfomation.nft_gated?.network || "base",
    contract_address: serverInfomation.nft_gated?.contract_address || "",
    required_balance: serverInfomation.nft_gated?.required_balance || 1,
  });

  const fetchServerNFT = useCallback(
    async (info: NFTInfoProps) => {
      setLoading(true);
      try {
        const apiResponse = await fetch("/api/servers/server-nft", {
          method: "PATCH",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ nftInfo: info, serverId }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          console.log(apiResponse);
          return;
        }
        const response = await apiResponse.json();
        if (
          response.statusCode === 200 &&
          response.message === "Operation successful"
        ) {
          updateServerNFTGatingList(serverId, response.data);
          updateServerNFTInformation(response.data);
          setOriginalNftInfo(info);
          setIsNFT(true);
          setIsDialogOpen(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [
      fingerprintHash,
      serverId,
      updateServerNFTInformation,
      updateServerNFTGatingList,
    ]
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShieldAlt} className="text-primary" />
          NFT Server Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNFT ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCoins}
                  className="text-muted-foreground"
                />
                <Label htmlFor="nft-toggle" className="text-sm font-medium">
                  {statusNFT ? "NFT Gating Enabled" : "NFT Gating Disabled"}
                </Label>
              </div>
              <Switch
                id="nft-toggle"
                checked={statusNFT}
                onCheckedChange={(value) => {
                  setStatusNFT(value);
                  const newInfo = { ...nftInfo, enabled: value };
                  setNftInfo(newInfo);
                  fetchServerNFT(newInfo);
                }}
              />
            </div>
            {originalNftInfo && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Network:</strong> {originalNftInfo.network}
                </p>
                <p>
                  <strong>Contract:</strong>{" "}
                  {originalNftInfo.contract_address.slice(0, 10)}...
                </p>
                <p>
                  <strong>Required Balance:</strong>{" "}
                  {originalNftInfo.required_balance}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="w-full"
            >
              <FontAwesomeIcon icon={faNetworkWired} className="mr-2" />
              Configure NFT Settings
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <FontAwesomeIcon
              icon={faCoins}
              className="text-4xl text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Gate your server with NFT ownership. Only users with the required
              NFT balance can join.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full">
              Set Up NFT Gating
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} />
              NFT Server Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Blockchain Network</Label>
              <ToggleGroup
                type="single"
                onValueChange={(value) => {
                  if (!value) return;
                  setNftInfo((prev) => ({ ...prev, network: value }));
                }}
                value={nftInfo.network}
                className="justify-start mt-2"
              >
                <ToggleGroupItem value="base">Base</ToggleGroupItem>
                <ToggleGroupItem value="bsc">BSC</ToggleGroupItem>
                <ToggleGroupItem value="ethereum">Ethereum</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <Label htmlFor="contract_address" className="text-sm font-medium">
                NFT Contract Address
              </Label>
              <Input
                id="contract_address"
                placeholder="0x..."
                value={nftInfo.contract_address}
                onChange={(e) =>
                  setNftInfo({ ...nftInfo, contract_address: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="required_balance" className="text-sm font-medium">
                Minimum NFT Balance Required
              </Label>
              <Input
                id="required_balance"
                type="number"
                min={1}
                value={nftInfo.required_balance}
                onChange={(e) =>
                  setNftInfo({
                    ...nftInfo,
                    required_balance: Number(e.target.value),
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={loading}
              onClick={() => {
                const newInfo = { ...nftInfo, enabled: true };
                setNftInfo(newInfo);
                fetchServerNFT(newInfo);
              }}
            >
              {loading ? "Saving..." : "Save & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
