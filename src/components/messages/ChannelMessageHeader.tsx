"use client";

import { ChannelProps } from "@/interfaces/server.interface";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AirdropDropdown from "@/components/airdrop/AirdropDropdown";
import ChannelSearchBar from "@/components/search/ChannelSearchBar";
import ChannelFileList from "@/components/messages/ChannelFileList";
import ServerMemberList from "@/components/messages/ServerMemberList";

interface ChannelMessageHeaderProps {
  channel: ChannelProps | null;
  serverId: string;
  channelId: string;
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
  audioElement?: React.ReactNode;
  debugInfo?: React.ReactNode;
}

export default function ChannelMessageHeader({
  channel,
  serverId,
  channelId,
  setMessageSearchId,
  audioElement,
  debugInfo,
}: ChannelMessageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
      {audioElement}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FontAwesomeIcon icon={faHashtag} className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              {channel?.name}
            </h1>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ChannelSearchBar
          channelId={channelId}
          setMessageSearchId={setMessageSearchId}
        />
        <AirdropDropdown serverId={serverId} />
        <ChannelFileList serverId={serverId} />
        <ServerMemberList />
        {debugInfo}
      </div>
    </div>
  );
}
