"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useChannelMember } from "@/hooks/useChannelMember";

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const { channelMembers } = useChannelMember();
  const [channelNotFound, setChannelNotFound] = useState(false);

  useEffect(() => {
    if (channelId && channelMembers) {
      const channelExists = channelMembers.some(
        (channel) => channel._id === channelId
      );
      if (!channelExists) {
        setChannelNotFound(true);
      } else {
        setChannelNotFound(false);
      }
    }
  }, [channelId, channelMembers]);

  if (channelNotFound) {
    return (
     <div className="h-full flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Channel does not exist</h2>
            <p className="text-sm text-muted-foreground">
              You may have entered the wrong path, the channel has been deleted,
              or you no longer have access.
            </p>
          </div>

          <Button
            onClick={() => router.push(`/app/channels/${serverId}`)}
            className="mt-2"
          >
            Back to Server
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
