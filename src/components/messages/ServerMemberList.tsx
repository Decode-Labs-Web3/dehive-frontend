"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerMember } from "@/hooks/useServerMember";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

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
            <SheetDescription>Member list.</SheetDescription>
          </SheetHeader>
          {serverMembers.map((member) => (
            <div
              key={member.user_id}
              className="p-2 border-b border-border last:border-0"
            >
              <div className="font-medium">{member.username}</div>
              <div className="text-sm text-muted-foreground">
                Status: {member.status}
              </div>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </>
  );
}
