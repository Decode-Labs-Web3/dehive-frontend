"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { serverTag } from "@/constants/index.constants";
import ServerBarItems from "@/components/ServerBarItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useServerRefresh } from "@/contexts/ServerRefreshContext.contexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _v: boolean;
}

interface ServerPannel {
  server: ServerProps;
  fetchServerInfo: () => void;
  setServerPannel: React.Dispatch<React.SetStateAction<boolean>>;
  setServerSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ServerPannel({
  server,
  fetchServerInfo,
  setServerPannel,
  setServerSettingModal,
}: ServerPannel) {
  const router = useRouter();
  const { triggerRefeshServer } = useServerRefresh();

  const allFalse = {
    profile: false,
    tag: false,
    members: false,
    invites: false,
    role: false,
    bans: false,
    delete: false,
  };

  const [serverPannelSetting, setServerPannelSetting] = useState({
    ...allFalse,
    profile: true,
  });

  const [editServerForm, setEditServerForm] = useState({
    name: server.name,
    description: server.description,
  });

  const [deleteServerForm, setDeleteServerFrom] = useState({
    name: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(server.tags);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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

  const serverInfoChange =
    editServerForm.name !== server.name ||
    editServerForm.description !== server.description;

  const handleEditServer = async () => {
    const name = editServerForm.name.trim();
    const description = editServerForm.description.trim();

    const missing = name === "" || description === "";
    const nothingChanged =
      name === server.name && description === server.description;

    if (missing || nothingChanged) return;

    try {
      const apiResponse = await fetch("/api/servers/server/patch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          serverId: server._id,
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
      console.log("this is response from edit server", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        fetchServerInfo?.();
        setServerPannel(true);
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for edit server");
    }
  };

  const handleDeleteServer = async () => {
    if (deleteServerForm.name.trim() !== server.name) {
      console.log("The type the server name didn't macth");
      return;
    }

    try {
      const apiResponse = await fetch("/api/servers/server/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId: server._id }),
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
        router.push("/app/channels/me");
        triggerRefeshServer?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for delete server");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <aside className="flex w-64 flex-col border-r border-border bg-secondary">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {editServerForm.name}
              </p>
            </div>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-3">
            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() =>
                setServerPannelSetting({ ...allFalse, profile: true })
              }
            >
              Server Profile
            </Button>

            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() => setServerPannelSetting({ ...allFalse, tag: true })}
            >
              Server Tag
            </Button>

            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() =>
                setServerPannelSetting({ ...allFalse, members: true })
              }
            >
              Members
            </Button>

            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() =>
                setServerPannelSetting({ ...allFalse, invites: true })
              }
            >
              Invites
            </Button>

            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() => {
                setServerPannelSetting({ ...allFalse, role: true });
              }}
            >
              Role
            </Button>

            <Button
              className="w-full justify-start bg-background text-foreground hover:bg-accent"
              onClick={() => {
                setServerPannelSetting({ ...allFalse, bans: true });
              }}
            >
              Bans
            </Button>

            <div className="my-4 border border-foreground" />

            <Button
              className="w-full justify-between bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
              onClick={() => {
                setServerPannelSetting({ ...allFalse, delete: true });
              }}
            >
              Delete Server
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </nav>
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
                setServerPannel(false);
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
            {serverPannelSetting.members && (
              <>
                <ServerBarItems.ServerMembers
                  server={server}
                  fetchServerInfo={fetchServerInfo}
                  setServerPannel={setServerPannel}
                />
              </>
            )}

            {serverPannelSetting.bans && (
              <>
                <ServerBarItems.ServerBans server={server} />
              </>
            )}

            {serverPannelSetting.profile && (
              <>
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
              </>
            )}

            {serverPannelSetting.tag && (
              <Card>
                <CardHeader>
                  <CardTitle>Server Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {serverTag.map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`justify-start ${
                          selectedTags.includes(tag)
                            ? "bg-background text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
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
                    onClick={() => setSelectedTags([])}
                    className={`mt-3 justify-start ${
                      selectedTags.length === 0
                        ? "bg-background text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    No tag
                  </Button>
                </CardContent>
              </Card>
            )}
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
                          name: server.name,
                          description: server.description,
                        });
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-success text-success-foreground hover:opacity-90"
                      onClick={handleEditServer}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <Dialog
        open={serverPannelSetting.delete}
        onOpenChange={(open) =>
          setServerPannelSetting((prev) => ({
            ...prev,
            delete: open,
            profile: open ? false : true,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              Please type the name of &quot;{server.name}&quot; to confirm.
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
              onClick={() =>
                setServerPannelSetting((prev) => ({
                  ...prev,
                  delete: false,
                  profile: true,
                }))
              }
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
              onClick={handleDeleteServer}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
