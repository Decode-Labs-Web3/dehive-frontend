"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerMember } from "@/hooks/useServerMember";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvartarComponent from "@/components/common/AvatarComponent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function ServerMemberList() {
  const [open, setOpen] = useState(false);
  const { serverMembers } = useServerMember();

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="p-2 hover:bg-accent rounded-md"
      >
        <FontAwesomeIcon icon={faUserGroup} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Member List</SheetTitle>
            <SheetDescription>Server Member List.</SheetDescription>
          </SheetHeader>
          {serverMembers.map((member) => (
            <div
              key={member.user_id}
              className="p-2 border-b border-border last:border-0 flex flex-row gap-2"
            >
              <AvartarComponent
                avatar_ipfs_hash={member.avatar_ipfs_hash}
                displayname={member.displayname}
                status={member.status}
              />
              <div className="flex flex-col">
                <div className="font-medium">{member.displayname}</div>
                <div className="font-medium">@{member.username}</div>
              </div>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </>
  );
}
