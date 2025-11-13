"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useDirectMember } from "@/hooks/useDirectMember";

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { channelId } = useParams<{
    channelId: string;
  }>();
  const { directMembers } = useDirectMember();
  const [channelNotFound, setChannelNotFound] = useState(false);

  useEffect(() => {
    if (channelId && directMembers) {
      const channelExists = directMembers.some(
        (member) => member.conversationid === channelId
      );
      if (!channelExists) {
        setChannelNotFound(true);
      } else {
        setChannelNotFound(false);
      }
    }
  }, [channelId, directMembers]);

  if (channelNotFound) {
    return (
     <div className="h-full flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Conversation does not exist</h2>
            <p className="text-sm text-muted-foreground">
              You may have entered the wrong path, the Conversation has been deleted,
              or you no longer have access.
            </p>
          </div>

          <Button
            onClick={() => router.push("/app/channels/me")}
            className="mt-2"
          >
            Back to Direct Messages
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
