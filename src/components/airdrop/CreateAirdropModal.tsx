"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useReadContract,
} from "wagmi";
import {
  parseUnits,
  formatUnits,
  isAddress,
  getAddress,
  decodeEventLog,
  type Address,
} from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  generateMerkleTree,
  prepareIPFSData,
  parseCSV,
  shuffleArray,
  type Claim,
} from "@/lib/airdropHelpers";
import {
  AIRDROP_CONTRACTS,
  SEPOLIA_CHAIN_ID,
} from "@/constants/airdrop.constants";
import { registryAbi, factoryAbi, erc20Abi } from "@/abi/airdropAbi";
import { useTokenInfo } from "@/hooks/useTokenInfo";

interface Member {
  _id: string;
  primary_wallet?: { address: string };
  wallets?: Array<{ address: string }>;
}

interface CreateAirdropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  onSuccess: () => void;
}

type RecipientType = "csv" | "all" | "random";

export default function CreateAirdropModal({
  open,
  onOpenChange,
  serverId,
  onSuccess,
}: CreateAirdropModalProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Recipient selection
  const [recipientType, setRecipientType] = useState<RecipientType>("all");
  const [csvContent, setCsvContent] = useState<string>("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [randomMin, setRandomMin] = useState<string>("10");
  const [randomMax, setRandomMax] = useState<string>("50");
  const [allocationAmount, setAllocationAmount] = useState<string>("");
  const [claims, setClaims] = useState<Claim[]>([]);
  // Store raw recipient data before token decimals are known
  const [recipientData, setRecipientData] = useState<
    Array<{ address: string; amount: string }>
  >([]);

  // Step 2: Campaign details
  const [campaignName, setCampaignName] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Step 3: Token info using hook
  const tokenInfoData = useTokenInfo(
    tokenAddress && isAddress(tokenAddress)
      ? (tokenAddress as Address)
      : undefined
  );

  const tokenInfo = useMemo(() => {
    return tokenInfoData.decimals !== undefined
      ? {
          name: tokenInfoData.name || "Unknown Token",
          symbol: tokenInfoData.symbol || "UNKNOWN",
          decimals: tokenInfoData.decimals,
        }
      : null;
  }, [tokenInfoData.decimals, tokenInfoData.name, tokenInfoData.symbol]);

  const [tokenAllowance, setTokenAllowance] = useState<bigint | null>(null);

  // Step 4: Preview and creation
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<bigint>(BigInt(0));
  const [factoryAddress, setFactoryAddress] = useState<`0x${string}` | null>(
    null
  );

  // Fetch token allowance
  const { data: allowance } = useReadContract({
    address:
      tokenAddress && isAddress(tokenAddress)
        ? (tokenAddress as Address)
        : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && factoryAddress ? [address, factoryAddress] : undefined,
    query: {
      enabled: Boolean(
        tokenAddress && isAddress(tokenAddress) && address && factoryAddress
      ),
    },
  });

  useEffect(() => {
    setTokenAllowance(allowance as bigint | null);
  }, [allowance]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/servers/members/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId }),
        cache: "no-cache",
      });

      if (!response.ok) throw new Error("Failed to fetch members");

      const result = await response.json();
      if (result.statusCode === 200) {
        setMembers(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setError("Failed to fetch server members");
    }
  }, [serverId]);

  // Fetch server members
  useEffect(() => {
    if (open && recipientType !== "csv") {
      fetchMembers();
    }
  }, [open, recipientType, fetchMembers]);

  // Handle CSV file upload
  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      try {
        parseCSV(content);
      } catch (error) {
        setCsvError(
          error instanceof Error ? error.message : "Invalid CSV format"
        );
      }
    };
    reader.readAsText(file);
  };

  // Step 1: Collect recipient data (without token decimals)
  const collectRecipientData = useCallback(() => {
    setError(null);
    let newRecipientData: Array<{ address: string; amount: string }> = [];

    try {
      if (recipientType === "csv") {
        if (!csvContent) {
          throw new Error("Please upload a CSV file");
        }
        const csvData = parseCSV(csvContent);
        newRecipientData = csvData.map((row) => ({
          address: row.address,
          amount: row.amount, // Store as string, will parse with decimals later
        }));
      } else if (recipientType === "all") {
        if (!allocationAmount) {
          throw new Error("Please enter allocation amount");
        }
        if (
          isNaN(parseFloat(allocationAmount)) ||
          parseFloat(allocationAmount) <= 0
        ) {
          throw new Error("Allocation amount must be a positive number");
        }
        const membersWithWallets = members.filter(
          (m) => m.primary_wallet?.address || m.wallets?.[0]?.address
        );
        if (membersWithWallets.length === 0) {
          throw new Error("No members with wallets found");
        }
        newRecipientData = membersWithWallets.map((member) => ({
          address: member.primary_wallet?.address || member.wallets![0].address,
          amount: allocationAmount, // Store as string, will parse with decimals later
        }));
      } else if (recipientType === "random") {
        if (!allocationAmount) {
          throw new Error("Please enter allocation amount");
        }
        if (
          isNaN(parseFloat(allocationAmount)) ||
          parseFloat(allocationAmount) <= 0
        ) {
          throw new Error("Allocation amount must be a positive number");
        }
        const min = parseInt(randomMin);
        const max = parseInt(randomMax);
        if (
          isNaN(min) ||
          isNaN(max) ||
          min < 1 ||
          max < min ||
          max > members.length
        ) {
          throw new Error(
            `Invalid range: ${min}-${max}. Max available: ${members.length}`
          );
        }
        const membersWithWallets = members.filter(
          (m) => m.primary_wallet?.address || m.wallets?.[0]?.address
        );
        if (membersWithWallets.length === 0) {
          throw new Error("No members with wallets found");
        }
        const shuffled = shuffleArray(membersWithWallets);
        const selected = shuffled.slice(
          0,
          Math.floor(Math.random() * (max - min + 1)) + min
        );
        newRecipientData = selected.map((member) => ({
          address: member.primary_wallet?.address || member.wallets![0].address,
          amount: allocationAmount, // Store as string, will parse with decimals later
        }));
      }

      if (newRecipientData.length === 0) {
        throw new Error("No valid recipients found");
      }

      setRecipientData(newRecipientData);
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to collect recipient data"
      );
      return false;
    }
  }, [
    recipientType,
    csvContent,
    members,
    allocationAmount,
    randomMin,
    randomMax,
  ]);

  // Generate claims from recipient data (requires token decimals)
  const generateClaims = useCallback(() => {
    if (!tokenInfo || recipientData.length === 0) {
      return false;
    }

    try {
      const newClaims: Claim[] = recipientData.map((data, index) => ({
        index,
        account: getAddress(data.address.toLowerCase()),
        amount: parseUnits(data.amount, tokenInfo.decimals),
      }));

      setClaims(newClaims);
      return true;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to generate claims"
      );
      return false;
    }
  }, [recipientData, tokenInfo]);

  // Step 1: Handle next
  const handleStep1Next = async () => {
    const success = collectRecipientData();
    if (success) {
      setStep(2);
    }
  };

  // Step 2: Validate and proceed
  const handleStep2Next = () => {
    if (!campaignName.trim()) {
      setError("Campaign name is required");
      return;
    }
    if (!tokenAddress || !isAddress(tokenAddress)) {
      setError("Valid token address is required");
      return;
    }
    if (!tokenInfo) {
      setError("Please wait for token info to load");
      return;
    }
    // Generate claims now that we have token info
    const success = generateClaims();
    if (success) {
      setStep(3);
    }
  };

  // Step 3: Generate Merkle tree and upload to IPFS
  const handleStep3Next = async () => {
    if (!tokenInfo || claims.length === 0) {
      setError("Missing token info or claims");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate total amount
      const total = claims.reduce(
        (sum, claim) => sum + claim.amount,
        BigInt(0)
      );
      setTotalAmount(total);

      // Generate Merkle tree
      const merkleTreeData = generateMerkleTree(claims);
      setMerkleRoot(merkleTreeData.root);

      // Prepare IPFS data
      const ipfsData = prepareIPFSData(
        {
          name: campaignName,
          description: description,
          token: tokenAddress,
          merkleRoot: merkleTreeData.root,
          totalAmount: total.toString(),
        },
        claims,
        merkleTreeData
      );

      // Upload to IPFS
      const uploadResponse = await fetch("/api/airdrop/ipfs-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(ipfsData),
      });

      if (!uploadResponse.ok) {
        throw new Error("IPFS upload failed");
      }

      const uploadResult = await uploadResponse.json();
      setIpfsHash(uploadResult.data.hash);

      // Get or create factory
      let factory = (await publicClient?.readContract({
        address: AIRDROP_CONTRACTS.registry,
        abi: registryAbi,
        functionName: "getFactoryByServerId",
        args: [serverId],
      })) as `0x${string}` | undefined;

      if (
        !factory ||
        factory === "0x0000000000000000000000000000000000000000"
      ) {
        // Create factory
        if (!address) throw new Error("Wallet not connected");
        const txHash = await writeContractAsync({
          address: AIRDROP_CONTRACTS.registry,
          abi: registryAbi,
          functionName: "createFactoryForServer",
          args: [serverId, address],
          chainId: SEPOLIA_CHAIN_ID,
        });

        await publicClient?.waitForTransactionReceipt({ hash: txHash });

        // Get factory address from event or query again
        factory = (await publicClient?.readContract({
          address: AIRDROP_CONTRACTS.registry,
          abi: registryAbi,
          functionName: "getFactoryByServerId",
          args: [serverId],
        })) as `0x${string}` | undefined;
      }

      if (!factory) {
        throw new Error("Failed to get factory address");
      }

      setFactoryAddress(factory);
      setStep(4);
    } catch (error) {
      console.error("Step 3 error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to prepare campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Approve and create
  const handleApproveAndCreate = async () => {
    if (!address || !factoryAddress || !tokenInfo) {
      setError("Missing required data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if approval needed
      if (!tokenAllowance || tokenAllowance < totalAmount) {
        // Approve tokens
        const approveTx = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [factoryAddress, totalAmount],
          chainId: SEPOLIA_CHAIN_ID,
        });

        await publicClient?.waitForTransactionReceipt({ hash: approveTx });
      }

      // Create campaign
      const createTx = await writeContractAsync({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "createAirdropAndFund",
        args: [
          tokenAddress as `0x${string}`,
          merkleRoot as `0x${string}`,
          `ipfs://${ipfsHash}`,
          totalAmount,
        ],
        chainId: SEPOLIA_CHAIN_ID,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: createTx,
      });

      // Extract campaign address from event
      // The event AirdropCampaignCreated contains the campaign address as the first indexed parameter
      let campaignCreatedEvent = null;
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: factoryAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded?.eventName === "AirdropCampaignCreated") {
              campaignCreatedEvent = decoded;
              break;
            }
          } catch {
            // Continue to next log
          }
        }
      }

      if (campaignCreatedEvent) {
        onSuccess();
        onOpenChange(false);
        // Reset form
        resetForm();
      } else {
        throw new Error("Failed to find campaign address in transaction");
      }
    } catch (error) {
      console.error("Create campaign error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setRecipientType("all");
    setCsvContent("");
    setCampaignName("");
    setTokenAddress("");
    setDescription("");
    setAllocationAmount("");
    setClaims([]);
    setRecipientData([]);
    setMerkleRoot("");
    setIpfsHash("");
    setTotalAmount(BigInt(0));
    setFactoryAddress(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Airdrop Campaign</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 && "Select Recipients"}
            {step === 2 && "Campaign Details"}
            {step === 3 && "Token Info & Preview"}
            {step === 4 && "Approve & Create"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Recipient Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <Tabs
              value={recipientType}
              onValueChange={(v) => setRecipientType(v as RecipientType)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                <TabsTrigger value="all">All Members</TabsTrigger>
                <TabsTrigger value="random">Random Members</TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: address,amount (one per line)
                  </p>
                  {csvError && (
                    <p className="text-xs text-destructive">{csvError}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allocation-amount">Allocation Amount</Label>
                  <Input
                    id="allocation-amount"
                    type="text"
                    placeholder="0.0"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Each member will receive this amount
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Members with wallets:{" "}
                    {
                      members.filter(
                        (m) =>
                          m.primary_wallet?.address || m.wallets?.[0]?.address
                      ).length
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="random" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="random-min">Min Recipients</Label>
                    <Input
                      id="random-min"
                      type="number"
                      min="1"
                      value={randomMin}
                      onChange={(e) => setRandomMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="random-max">Max Recipients</Label>
                    <Input
                      id="random-max"
                      type="number"
                      min="1"
                      value={randomMax}
                      onChange={(e) => setRandomMax(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="random-allocation">Allocation Amount</Label>
                  <Input
                    id="random-allocation"
                    type="text"
                    placeholder="0.0"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available members: {members.length}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Campaign Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name *</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="My Airdrop Campaign"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-address">Token Address *</Label>
              <Input
                id="token-address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
              />
              {tokenAddress && !isAddress(tokenAddress) && (
                <p className="text-xs text-destructive">
                  Invalid address format
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your airdrop campaign..."
                rows={4}
              />
            </div>
            {recipientData.length > 0 && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm">
                  <strong>{recipientData.length}</strong> recipients will be
                  included
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Token Info & Preview */}
        {step === 3 && (
          <div className="space-y-4">
            {tokenInfoData.isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading token info...
              </div>
            ) : tokenInfo ? (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Token Name:
                    </span>
                    <span className="text-sm font-medium">
                      {tokenInfo.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Symbol:
                    </span>
                    <span className="text-sm font-medium">
                      {tokenInfo.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Decimals:
                    </span>
                    <span className="text-sm font-medium">
                      {tokenInfo.decimals}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Your Balance:
                    </span>
                    <span className="text-sm font-medium">
                      {tokenInfoData.balance !== undefined
                        ? formatUnits(tokenInfoData.balance, tokenInfo.decimals)
                        : tokenInfoData.isLoading
                        ? "Loading..."
                        : "..."}{" "}
                      {tokenInfo.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Required:
                    </span>
                    <span className="text-sm font-medium">
                      {formatUnits(totalAmount, tokenInfo.decimals)}{" "}
                      {tokenInfo.symbol}
                    </span>
                  </div>
                  {tokenInfoData.balance !== undefined &&
                    tokenInfoData.balance < totalAmount && (
                      <p className="text-xs text-destructive">
                        Insufficient balance
                      </p>
                    )}
                  {tokenInfoData.hasError && (
                    <p className="text-xs text-destructive">
                      Failed to load token info
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {tokenInfoData.hasError
                  ? "Failed to load token info. Please check the token address."
                  : "Enter a token address to load token info"}
              </div>
            )}
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Generating Merkle tree and uploading to IPFS...
              </div>
            )}
          </div>
        )}

        {/* Step 4: Approve & Create */}
        {step === 4 && tokenInfo && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold">Campaign Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{campaignName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="font-medium">{claims.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">
                      {formatUnits(totalAmount, tokenInfo.decimals)}{" "}
                      {tokenInfo.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merkle Root:</span>
                    <span className="font-mono text-xs truncate">
                      {merkleRoot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IPFS Hash:</span>
                    <span className="font-mono text-xs truncate">
                      {ipfsHash}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {tokenAllowance !== null && tokenAllowance < totalAmount && (
              <div className="p-3 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
                Token approval required. You will be prompted to approve{" "}
                {formatUnits(totalAmount, tokenInfo.decimals)}{" "}
                {tokenInfo.symbol}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={
                step === 1
                  ? handleStep1Next
                  : step === 2
                  ? handleStep2Next
                  : handleStep3Next
              }
              disabled={loading}
            >
              {loading ? "Processing..." : "Next"}
            </Button>
          ) : (
            <Button onClick={handleApproveAndCreate} disabled={loading}>
              {loading ? "Creating..." : "Approve & Create"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
