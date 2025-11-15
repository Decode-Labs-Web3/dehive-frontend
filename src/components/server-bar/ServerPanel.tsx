"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useEffect, useRef, useState } from "react";
import ServerBarItems from "@/components/server-bar";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useServersList } from "@/hooks/useServersList";
import { SERVER_TAGS } from "@/constants/index.constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  faBookOpen,
  faGamepad,
  faSchool,
  faTrashCan,
  faUserGroup,
  faX,
  faPeopleGroup,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";

const tagIcon: Record<string, IconDefinition> = {
  Gaming: faGamepad,
  Friends: faUserGroup,
  "Study Group": faBookOpen,
  "School Club": faSchool,
  "Local Community": faPeopleGroup,
  "Artist & Creators": faPalette,
};

interface ServerPanelProps {
  setServerPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setServerSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ServerPanel({
  setServerPanel,
  setServerSettingModal,
}: ServerPanelProps) {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const { removeServerList, updateServerInfomationList, updateServerTagsList } = useServersList();
  const tabsListContainerRef = useRef<HTMLDivElement | null>(null);
  const { serverInfomation ,updateServerInfomation, updateServerTagInfomation, removeServerInfomation } = useServerInfomation();
  useEffect(() => {
    const element = tabsListContainerRef.current;
    if (element) {
      element.scrollTop = 0;
    }
  }, []);

  const [serverPanelSetting, setServerPanelSetting] =
    useState<string>("profile");

  const [editServerForm, setEditServerForm] = useState({
    name: serverInfomation.name,
    description: serverInfomation.description,
  });

  const [deleteServerForm, setDeleteServerFrom] = useState({
    name: "",
  });

  const [selectedTags, setSelectedTags] = useState<string | null>(
    serverInfomation.tags.length > 0 ? serverInfomation.tags[0] : null
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = prev === tag ? null : tag;
      handleServerTagChange(next);
      return next;
    });
  };

  const handleDeleteServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setDeleteServerFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setEditServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleServerTagChange = async (nextTag: string | null) => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server-tag", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          serverId: serverInfomation._id,
          tag: nextTag ?? "",
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      console.log("this is response from edit server tag", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        updateServerTagsList(serverInfomation._id, nextTag ?? "");
        updateServerTagInfomation(nextTag ?? "");
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for edit server tag");
    } finally {
      setLoading(false);
    }
  };

  const serverInfoChange =
    editServerForm.name !== serverInfomation.name ||
    editServerForm.description !== serverInfomation.description;

  const handleEditServer = async () => {
    const name = editServerForm.name.trim();
    const description = editServerForm.description.trim();

    const missing = name === "" || description === "";
    const nothingChanged =
      name === serverInfomation.name && description === serverInfomation.description;

    if (missing || nothingChanged) return;

    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/patch", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          serverId: serverInfomation._id,
          name: editServerForm.name,
          description: editServerForm.description,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      // console.log("this is response from edit server", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        updateServerInfomationList(
          serverInfomation._id,
          editServerForm.name,
          editServerForm.description
        );
        updateServerInfomation(editServerForm.name, editServerForm.description);
        setServerPanel(true);
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for edit server");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (deleteServerForm.name.trim() !== serverInfomation.name) {
      console.log("The type the server name didn't macth");
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/delete", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId: serverInfomation._id }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      // console.log("ewdweqedqwdeqwdwedwqdwedwedwedwedwedqwdwe", response);
      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        removeServerList(serverInfomation._id)
        removeServerInfomation();
        router.push("/app/channels/me");
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for delete server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <Tabs
          value={serverPanelSetting}
          onValueChange={setServerPanelSetting}
          orientation="vertical"
          className="flex h-full w-full"
        >
          <aside className="flex h-full w-64 flex-col border-r border-border">
            <div className="px-6 pb-4 pt-6 shrink-0 border-b border-border bg-background">
              <div className="mt-4 flex items-center gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-foreground">
                    Server Settings
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
                  value="profile"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Server Profile
                </TabsTrigger>
                <TabsTrigger
                  value="tag"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Server Tag
                </TabsTrigger>
                <TabsTrigger
                  value="nft"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Server NFT
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Server Log
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value="bans"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Bans
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-2 shrink-0 px-3 pb-4">
              <div className="mb-4 h-px w-full bg-border" />
              <Button
                variant="destructive"
                className="w-full flex items-center justify-between px-3"
                onClick={() => setServerPanelSetting("delete")}
              >
                <span>Delete Server</span>
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
                disabled={serverInfoChange}
                onClick={() => {
                  if (serverInfoChange) return;
                  setServerPanel(false);
                  setServerSettingModal(false);
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
              <TabsContent value="members" className="mt-0">
                <ServerBarItems.ServerMembers
                  setServerPanel={setServerPanel}
                />
              </TabsContent>

              <TabsContent value="bans" className="mt-0">
                <ServerBarItems.ServerBans />
              </TabsContent>

              <TabsContent value="nft" className="mt-0">
                <ServerBarItems.ServerNFT />
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <ServerBarItems.ServerLog />
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <div className="max-w-xl mt-4 space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Server Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={editServerForm.name}
                      onChange={handleEditServerChange}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-w-xl mt-4 space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Server Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={editServerForm.description}
                      onChange={handleEditServerChange}
                      autoFocus
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tag" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVER_TAGS.map((tag) => (
                        <Button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`justify-start ${
                            selectedTags === tag
                              ? "bg-background text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                          disabled={loading}
                        >
                          <span className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                              <FontAwesomeIcon icon={tagIcon[tag]} />
                            </span>
                            <span>{tag}</span>
                          </span>
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedTags(null);
                        handleServerTagChange(null);
                      }}
                      className={`mt-3 justify-start ${
                        selectedTags === null
                          ? "bg-background text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      disabled={loading}
                    >
                      No tag
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {serverInfoChange && (
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
                          setEditServerForm({
                            name: serverInfomation.name,
                            description: serverInfomation.description,
                          });
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:opacity-90"
                        onClick={handleEditServer}
                        disabled={loading}
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
        open={serverPanelSetting === "delete"}
        onOpenChange={(open) =>
          setServerPanelSetting(open ? "delete" : "profile")
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              Please type the name of &quot;{serverInfomation.name}&quot; to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            id="name"
            name="name"
            value={deleteServerForm.name}
            onChange={handleDeleteServerChange}
          />
          <DialogFooter>
            <Button
              className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setServerPanelSetting("profile")}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
              onClick={handleDeleteServer}
              disabled={loading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
