"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  primary_wallet?: PrimaryWalletProps;
  following_number: number;
  followers_number: number;
  is_active: boolean;
  last_account_deactivation: string;
}

interface PrimaryWalletProps {
  _id: string;
  address: string;
  user_id: string;
  name_service: null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Wallet() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataProps>();
  useEffect(() => {
    const userInfo = localStorage.getItem("userData");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserData(user);
    }
  }, []);
  if (!userData) {
    return <h1>Loading...</h1>;
  }
  return (
    <>
      {userData.primary_wallet ? (
        <ConnectButton />
      ) : (
        <Button
          onClick={() =>
            router.push("https://app.decodenetwork.app/dashboard/wallets")
          }
        >
          Register Primary Wallet
        </Button>
      )}
    </>
  );
}
