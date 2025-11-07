"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  faTrashCan,
  faHashtag,
  faVolumeHigh,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChannelPanelProps {
  channel: ChannelProps;
  fetchCategoryInfo: () => void;
  handleDeleteChannel: (channelId: string) => void;
  setChannelPanel: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function ChannelPanel({
  channel,
  setChannelPanel,
  fetchCategoryInfo,
  handleDeleteChannel,
}: ChannelPanelProps) {
  const [editChannelForm, setEditChannelForm] = useState({
    name: channel.name,
  });
  const [channelPanelSetting, setChannelPanelSetting] =
    useState<string>("overview");

  const handleEditChannelChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditChannelForm({ name: event.target.value });
  };

  const channelNameChange = editChannelForm.name !== channel.name;

  const handleEditChannel = async (channelId: string) => {
    try {
      const apiResponse = await fetch("/api/servers/channel/patch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          channelId,
          name: editChannelForm.name,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        fetchCategoryInfo?.();
        setChannelPanel((prev) => ({
          ...prev,
          [channel._id]: true,
        }));
      }
    } catch (error) {
      console.error(error);
      console.log("Server edit channel error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <Tabs
          value={channelPanelSetting}
          onValueChange={setChannelPanelSetting}
          orientation="vertical"
          className="flex h-full w-full"
        >
          <aside className="flex h-full w-64 flex-col border-r border-border">
            <div className="px-6 pb-4 pt-6 shrink-0 border-b border-border bg-background">
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <FontAwesomeIcon
                    icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-foreground">
                    Channel Settings
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4">
              <TabsList
                className="flex flex-col w-full bg-transparent gap-0 p-0"
                vertical
              >
                <TabsTrigger
                  value="overview"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="invites"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Invites
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Integrations
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-2 shrink-0 px-3 pb-4">
              <div className="mb-4 h-px w-full bg-border" />
              <Button
                variant="destructive"
                className="w-full flex items-center justify-between px-3"
                onClick={() => setChannelPanelSetting("delete")}
              >
                <span>Delete Channel</span>
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </aside>

          <section className="relative flex flex-1 flex-col bg-background">
            <header className="flex items-center justify-between border-b border-border px-10 py-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {true ? "Overview" : "Permissions"}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  {true
                    ? "Customize your channel"
                    : "Control who can access these channels"}
                </h2>
              </div>

              <Button
                size="sm"
                disabled={channelNameChange}
                onClick={() => {
                  if (channelNameChange) return;
                  setChannelPanel((prev) => ({
                    ...prev,
                    [channel._id]: false,
                  }));
                }}
                className="flex flex-col items-center gap-1 text-xs uppercase bg-background text-foreground hover:bg-accent"
              >
                <span className="rounded-full border border-border p-2 ">
                  <FontAwesomeIcon icon={faX} />
                </span>
                Esc
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8">
              <TabsContent value="overview" className="mt-0">
                <div className="max-w-xl mt-4 space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Channel Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={editChannelForm.name}
                      onChange={handleEditChannelChange}
                      autoFocus
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <div className="text-sm text-muted-foreground">
                  Permissions settings coming soon.
                </div>
              </TabsContent>
              <TabsContent value="invites" className="mt-0">
                <div className="text-sm text-muted-foreground">
                  Invites management coming soon.
                </div>
              </TabsContent>
              <TabsContent value="integrations" className="mt-0">
                <div className="text-sm text-muted-foreground">
                  Integrations configuration coming soon.
                </div>
              </TabsContent>
            </div>

            {channelNameChange && (
              <Card className="pointer-events-auto absolute inset-x-8 bottom-6 border-success/30 bg-success/10">
                <CardContent className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Careful — you have unsaved changes!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Save or reset your edits before closing this panel.
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <Button
                        size="sm"
                        className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setEditChannelForm({ name: channel.name });
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:opacity-90"
                        onClick={() => handleEditChannel(channel._id)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </Tabs>
      </div>

      <Dialog
        open={channelPanelSetting === "delete"}
        onOpenChange={(open) =>
          setChannelPanelSetting(open ? "delete" : "overview")
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{channel.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setChannelPanelSetting("overview")}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
              onClick={() => handleDeleteChannel(channel._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
