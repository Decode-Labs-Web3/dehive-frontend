"use client"

import { useFingerprint } from "@/hooks/useFingerprint";
import { useParams } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { ServerProps } from "@/interfaces/server.interface";

interface ServerNFTProps {
  server: ServerProps;
}

export default function ServerNFT({server} : ServerNFTProps) {
  // const { fingerprintHash } = useFingerprint();
  // const { serverId } = useParams<{ serverId: string }>();
  // const [loading, setLoading] = useState(false);
  // const [nftInfo, setNftInfo] = useState<string | null>(null);

  // const fetchServerNFT = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const apiResponse = await fetch("/api/servers/server-nft", {
  //       method: "POST",
  //       headers: getApiHeaders(fingerprintHash, {
  //         "Content-Type": "application/json",
  //       }),
  //       body: JSON.stringify({ serverId })}},
  //       cache: "no-store",
  //       signal: AbortSignal.timeout(10000),
  //     });

  //     if (!apiResponse.ok) {
  //       console.log(apiResponse);
  //       return;
  //     }
  //     const response = await apiResponse.json();
  //     setNftInfo(response.data.nftUri);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [serverId]);

  // useEffect(() => {
  //   fetchServerNFT();
  // }, [fetchServerNFT]);

  // if (loading) {
  //   return <Skeleton className="w-full h-48" />;
  // }

  // if (!nftInfo) {
  //   return <div className="text-sm text-muted-foreground">No NFT linked.</div>;
  // }

  return (
    // <div className="w-full h-48">
    //   <img
    //     src={nftInfo}
    //     alt="Server NFT"
    //     className="w-full h-full object-cover rounded-md"
    //   />
    // </div>
    <></>
  );
}
