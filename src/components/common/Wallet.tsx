"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Wallet() {
  const router = useRouter();
  const { user } = useUser();
  return (
    <>
      {user?.primary_wallet ? (
        <ConnectButton />
      ) : (
        <Button
          onClick={() =>
            router.push("https://decode.decodenetwork.app/dashboard/wallets")
          }
        >
          Register Primary Wallet
        </Button>
      )}
    </>
  );
}
