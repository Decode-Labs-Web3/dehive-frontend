"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useParams, useRouter } from "next/navigation";

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { serverRoot } = useServerRoot();
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const [channelNotFound, setChannelNotFound] = useState(false);

  useEffect(() => {
    const channelExists = serverRoot
      ?.flatMap((category) => category.channels)
      .some((channel) => channel._id === channelId);
    if (!channelExists) {
      setChannelNotFound(true);
    } else {
      setChannelNotFound(false);
    }
  }, [serverId, channelId, serverRoot]);

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
