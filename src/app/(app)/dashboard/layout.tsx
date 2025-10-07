"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Dashboard from "@/components/(dashboard)";

interface UserDataProps {
  _id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  __v: number;
  following_number: number;
  followers_number: number;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("dm");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserDataProps | null>(null);

  useEffect(() => {
    if (pathname === "/dashboard/dm") {
      setActiveId("dm");
    } else if (pathname.startsWith("/dashboard/server/")) {
      const serverId = pathname.split("/dashboard/server/")[1];
      if (serverId) {
        setActiveId(serverId);
      }
    }
  }, [pathname]);

  const handleUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("api/user/user-info", {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      // console.log("this is userdata response from layout", response.data);
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    handleUserData();
  }, [handleUserData]);

  if (loading) {
    <>Loading...</>;
  }

  return (
    <>
      <Dashboard.GuildBar activeId={activeId} setActiveId={setActiveId} />
      <Dashboard.ChannelBar activeId={activeId} />
      {userData && <Dashboard.UserBar userData={userData} />}
      <div className="fixed top-0 left-[calc(4rem+15rem)]">{children}</div>
    </>
  );
}
