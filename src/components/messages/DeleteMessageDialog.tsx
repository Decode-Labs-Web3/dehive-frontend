"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AvatarComponent from "@/components/common/AvatarComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: any;
  onDelete: (messageId: string) => void;
  getStatus?: (message: any) => string | undefined;
}

export default function DeleteMessageDialog({
  open,
  onOpenChange,
  message,
  onDelete,
  getStatus,
}: DeleteMessageDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(message._id);
    onOpenChange(false);
  };

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-popover-foreground">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete this message?
          </DialogDescription>
        </DialogHeader>

        <Card className="mt-4 bg-card border-border">
          <CardContent className="px-4 py-3">
            <div className="flex items-start gap-3">
              <AvatarComponent
                avatar_ipfs_hash={message.sender.avatar_ipfs_hash!}
                displayname={message.sender.display_name}
                status={getStatus ? getStatus(message) : undefined}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base font-semibold text-accent">
                    {message.sender.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                  {message.content}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button
            onClick={handleCancel}
            className="h-12 w-full max-w-[240px] rounded-xl bg-secondary text-secondary-foreground shadow-sm transition hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="h-12 w-full max-w-[240px] rounded-xl bg-destructive text-destructive-foreground shadow-sm transition hover:bg-destructive/80"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
