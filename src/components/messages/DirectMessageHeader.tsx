"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Wallet from "@/components/common/Wallet";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import AvatarComponent from "@/components/common/AvatarComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DirectSearchBar from "@/components/search/DirectSearchBar";
import DirectFileList from "@/components/messages/DirectFileList";
import { DirectMemberListProps } from "@/interfaces/user.interface";

interface DirectMessageHeaderProps {
  userChatWith: DirectMemberListProps;
  channelId: string;
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
  onCallClick: () => void;
  privateMode?: boolean;
  setPrivateMode?: (value: boolean) => void;
  isAllowPrivate?: boolean;
  isConnected?: boolean;
  debugInfo?: React.ReactNode;
  audioElement?: React.ReactNode;
}

export default function DirectMessageHeader({
  userChatWith,
  channelId,
  setMessageSearchId,
  onCallClick,
  privateMode,
  setPrivateMode,
  isAllowPrivate,
  isConnected,
  debugInfo,
  audioElement,
}: DirectMessageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
      {audioElement}
      <div className="flex items-center gap-3">
        <AvatarComponent
          avatar_ipfs_hash={userChatWith?.avatar_ipfs_hash!}
          displayname={userChatWith?.displayname}
          status={userChatWith?.status}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              {userChatWith?.displayname}
            </h1>
          </div>
        </div>
      </div>
      {isAllowPrivate && (
        <>
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={privateMode}
                onCheckedChange={setPrivateMode}
              />
              <Label htmlFor="private">
                {privateMode ? "Private ON" : "Private OFF"}
              </Label>
            </div>
          ) : (
            <Wallet />
          )}
        </>
      )}
      <div className="flex items-center gap-3">
        <Button
          onClick={onCallClick}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
        </Button>
        <DirectSearchBar setMessageSearchId={setMessageSearchId} />
        <DirectFileList channelId={channelId} />
        {debugInfo}
      </div>
    </div>
  );
}
