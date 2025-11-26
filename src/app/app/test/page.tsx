"use client";

import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useTransferMoney } from "@/hooks/useTransferMoney";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState, useCallback } from "react";
import AvatarComponent from "@/components/common/AvatarComponent";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MoneyTransferDialog() {
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
    balance: string;
    logoURI?: string;
    chainId: number;
  };

  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);

  const fecthUserErc20 = useCallback(async () => {
    if (assetType !== "erc20" || !address || !open) return;
    setTokensLoading(true);
    setTokensError(null);
    try {
      const res = await fetch(`/api/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ address, chainId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setTokens(Array.isArray(json.tokens) ? json.tokens : []);
    } catch (e: any) {
      setTokensError(e?.message || "Failed to load tokens");
    } finally {
      setTokensLoading(false);
    }
  }, [assetType, address, open, chainId]);

  useEffect(() => {
    fecthUserErc20();
  }, [fecthUserErc20]);

  useEffect(() => {
    setRecipient(userB);
  }, []);

  const selectedToken = useMemo(
    () =>
      tokens.find(
        (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
      ),
    [tokens, tokenAddress]
  );

  const shortAddr = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

  const amountSuffix = useMemo(() => {
    if (assetType === "native") return "ETH"; // adjust per chain if needed
    return tokenSymbol || selectedToken?.symbol || "TOKEN";
  }, [assetType, tokenSymbol, selectedToken]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="lg" className="gap-2">
          <FontAwesomeIcon icon={faMoneyBillTransfer} />
          Transfer Money
        </Button>
        <AvatarComponent />
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
            Transfer Money
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label>Recipient</Label>
            <div className="px-3 py-2 rounded-md border font-mono text-sm bg-muted/30">
              {shortAddr(userB)}
            </div>
            <p className="text-xs text-muted-foreground">
              Funds are sent directly to this address.
            </p>
          </div>

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
          {assetType === "erc20" && (
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex gap-2">
                <DropdownMenu modal={false}>
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
                  <DropdownMenuContent className="z-[11002] w-80 max-h-80 overflow-auto">
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

              {selectedToken && (
                <p className="text-xs text-muted-foreground">
                  {selectedToken.symbol} • Decimals {selectedToken.decimals}
                </p>
              )}
              {tokensError && (
                <p className="text-xs text-red-500">{tokensError}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0.001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {amountSuffix}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Memo (optional)</Label>
            <Input
              placeholder="Note to recipient…"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

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
  );
}
