"use client";

import { useState, useEffect, useCallback } from "react";
import Dashboard from "@/components/(dashboard)";

interface UserDataProps {
  _id: string;
  username: string;
  display_name: string;
  email: string;
  avatar: string;
  bio: string;
  status: string;
  mutual_servers_count: number;
  mutual_servers: [];
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>("dm");
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  // console.log("this is userdata from layout",userData)

  const handleUserData = useCallback(async () => {
    setLoading(true)
    try {
      const apiResponse = await fetch("api/user/user-info", {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if(!apiResponse){
        console.error(apiResponse)
        return
      }

      const response = await apiResponse.json()
      setUserData(response.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, []);

  useEffect(() => {
    handleUserData();
  }, [handleUserData]);

  if(loading){
    <>Loading...</>
  }

  return (
    <>
      <Dashboard.GuildBar activeId={activeId} setActiveId={setActiveId} />
      <Dashboard.ChannelBar activeId={activeId} />
      <Dashboard.UserBar userData={userData}/>
      <div className="fixed top-0 left-[calc(4rem+15rem)]">{children}</div>
    </>
  );
}
