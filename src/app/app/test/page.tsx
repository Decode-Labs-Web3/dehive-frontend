"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillTransfer,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

// shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTransferMoney } from "@/hooks/useTransferMoney";
import { useAccount, useChainId } from "wagmi";

export default function MoneyTransferDialog() {
  const userA = "0xdeb4dc315c9f952133c2cc2f953b965a3e87e332";
  const userB = "0x3f1fc384bd71a64cb031983fac059c9e452ad247";
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState<"native" | "erc20">("native");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [memo, setMemo] = useState("");
  const { address } = useAccount();
  const chainId = useChainId();
  const { transferMoney } = useTransferMoney();
  const [sending, setSending] = useState(false);

  type Token = {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string; // raw
    logoURI?: string;
    chainId: number;
  };

  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);

  // Load user's ERC-20s when needed
  useEffect(() => {
    let abort = false;
    async function load() {
      if (assetType !== "erc20" || !address || !open) return;
      setTokensLoading(true);
      setTokensError(null);
      try {
        const res = await fetch(
          `/api/tokens?address=${address}&chainId=${chainId || 1}`,
          {
            method: "GET",
            headers: { "X-Frontend-Internal-Request": "true" },
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (abort) return;
        setTokens(Array.isArray(json.tokens) ? json.tokens : []);
      } catch (e: any) {
        if (abort) return;
        setTokensError(e?.message || "Failed to load tokens");
      } finally {
        if (!abort) setTokensLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [assetType, address, open, chainId]);

  const selectedToken = useMemo(
    () =>
      tokens.find(
        (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
      ),
    [tokens, tokenAddress]
  );

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
            Transfer Money
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBillTransfer} />
              Transfer Money
            </DialogTitle>
            <DialogDescription>
              UI skeleton only — no logic wired yet.
            </DialogDescription>
          </DialogHeader>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>Recipient</Label>
            {userB}
            <p className="text-xs text-muted-foreground">
              ENS supported (visual only).
            </p>
          </div>

          {/* Asset type (Radio) */}
          <div className="space-y-2 mt-4">
            <Label>Asset</Label>
            <RadioGroup
              defaultValue="native"
              value={assetType}
              onValueChange={(v) => setAssetType(v as "native" | "erc20")}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
                <RadioGroupItem id="asset-native" value="native" />
                <Label htmlFor="asset-native" className="cursor-pointer">
                  Native
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
                <RadioGroupItem id="asset-erc20" value="erc20" />
                <Label htmlFor="asset-erc20" className="cursor-pointer">
                  ERC-20
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Token (only when ERC-20) */}
          {assetType === "erc20" && (
            <div className="space-y-2 mt-4">
              <Label>Token</Label>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {selectedToken ? (
                        <span>
                          {selectedToken.symbol || "Token"}
                          <span className="text-muted-foreground ml-2 text-xs">
                            {Number(selectedToken.balance) > 0
                              ? "• has balance"
                              : ""}
                          </span>
                        </span>
                      ) : tokensLoading ? (
                        "Loading tokens…"
                      ) : tokensError ? (
                        "Failed to load — use manual"
                      ) : tokens.length ? (
                        "Select a token"
                      ) : (
                        "No tokens found — use manual"
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 max-h-80 overflow-auto">
                    <DropdownMenuLabel>Your tokens</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tokens.map((t) => (
                      <DropdownMenuItem
                        key={t.address}
                        onClick={() => {
                          setTokenAddress(t.address);
                          setTokenSymbol(t.symbol || "ERC20");
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {t.symbol || "(no symbol)"}
                          </span>
                          <span className="text-xs text-muted-foreground break-all">
                            {t.address}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {t.name}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    {tokens.length === 0 && (
                      <div className="px-2 py-6 text-sm text-muted-foreground">
                        No ERC-20 balances detected for this chain.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Or enter token address</Label>
                <Input
                  placeholder="0xToken…"
                  value={tokenAddress}
                  onChange={(e) => {
                    setTokenAddress(e.target.value);
                    setTokenSymbol("");
                  }}
                />
                {selectedToken && (
                  <p className="text-xs text-muted-foreground">
                    {selectedToken.symbol} • Decimals {selectedToken.decimals}
                  </p>
                )}
                {tokensError && (
                  <p className="text-xs text-red-500">{tokensError}</p>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2 mt-4">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button variant="secondary" type="button">
                MAX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance preview here (static).
            </p>
          </div>

          {/* Memo & CID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Memo (optional)</Label>
              <Input
                placeholder="Note to recipient…"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>IPFS CID (optional)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">
                      <FontAwesomeIcon icon={faCircleInfo} className="mr-1" />
                      What is CID?
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Content identifier (IPFS). Stored as reference.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input placeholder="Qm…" />
            </div>
          </div>

          {/* Advanced (visual only) */}
          {assetType === "erc20" && (
            <div className="mt-4 border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Use Permit (EIP-2612)</div>
                <div className="text-xs text-muted-foreground">
                  Skip on-chain approve by signing a permit.
                </div>
              </div>
              <Switch />
            </div>
          )}

          {/* Estimate card (static placeholders) */}
          <Card className="mt-4 border-dashed">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Estimate</CardTitle>
              <CardDescription>
                Platform fee, recipient receive, gas (static)
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-4 text-sm grid gap-2">
              <div className="flex items-center justify-between">
                <span>Platform fee</span>
                <span>—%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fee amount</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Recipient receives</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Gas (est.)</span>
                <span>~ —</span>
              </div>
            </CardContent>
          </Card>

          {/* Warnings (static example) */}
          <Alert className="mt-4">
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Transfers are live. Ensure you are on the correct network and
              amounts are accurate.
            </AlertDescription>
          </Alert>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                sending ||
                !address ||
                !recipient ||
                !amount ||
                (assetType === "erc20" && !tokenAddress)
              }
              onClick={async () => {
                try {
                  setSending(true);
                  const result = await transferMoney({
                    recipient,
                    amount,
                    assetType,
                    tokenAddress:
                      assetType === "erc20" ? tokenAddress : undefined,
                    tokenSymbol:
                      assetType === "erc20"
                        ? tokenSymbol || selectedToken?.symbol || "ERC20"
                        : undefined,
                    memo,
                  });
                  console.log("Transfer success", result);
                  if (typeof window !== "undefined")
                    alert(`Sent!\nTx: ${result.txHash}\nCID: ${result.cid}`);
                  setOpen(false);
                  setRecipient("");
                  setAmount("");
                  setTokenAddress("");
                  setMemo("");
                } catch (e: any) {
                  console.error(e);
                  if (typeof window !== "undefined")
                    alert(e.message || "Transfer failed");
                } finally {
                  setSending(false);
                }
              }}
            >
              <FontAwesomeIcon icon={faMoneyBillTransfer} className="mr-2" />
              {sending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
