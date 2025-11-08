"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Separator } from "@/components/ui/separator";
import { useFingerprint } from "@/hooks/useFingerprint";
import { serverTag } from "@/constants/index.constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  faPlus,
  faGamepad,
  faUserGroup,
  faBookOpen,
  faSchool,
  faPeopleGroup,
  faPalette,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
interface Props {
  handleGetServer: () => void;
}

interface ServerForm {
  tags: string[];
  name: string;
  description: string;
}

const tagIcon: Record<string, IconDefinition> = {
  Gaming: faGamepad,
  Friends: faUserGroup,
  "Study Group": faBookOpen,
  "School Club": faSchool,
  "Local Community": faPeopleGroup,
  "Artist & Creators": faPalette,
};

export default function AddServer({ handleGetServer }: Props) {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const allFalse = { tag: false, info: false, invite: false };
  const [tab, setTab] = useState({ ...allFalse, tag: true });

  const [serverForm, setServerForm] = useState<ServerForm>({
    tags: [],
    name: "",
    description: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateServer = async () => {
    if (serverForm.name === "" || serverForm.description === "") {
      return;
    }
    console.log(serverForm);
    setIsLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/post", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(serverForm),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      // console.log(response);
      setTab({ ...allFalse, tag: true });
      setServerForm({
        tags: [],
        name: "",
        description: "",
      });
      handleGetServer();
      router.push(`/app/channels/${response.data._id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setModalOpen(false);
    }
  };

  const handleInvite = async () => {
    const raw = inviteLink.trim();
    if (raw === "") return;
    const code = raw.match(/code=([^&\s]+)/)?.[1] || raw;
    setIsLoading(true);
    try {
      const apiResponse = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        router.push("/");
        return;
      }
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        setModalOpen(false);
        setTab({ ...allFalse, tag: true });
        setInviteLink("");
        handleGetServer();
        const serverId = String(response.data.server_id);
        router.push(`/app/channels/${serverId}`);
      }
    } catch (error) {
      console.error(error);
      console.log("Server for Invite to server error");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              setTab({ ...allFalse, tag: true });
              setModalOpen(true);
              setServerForm({
                tags: [],
                name: "",
                description: "",
              });
            }}
            className="w-10 h-10 bg-background text-foreground hover:bg-accent"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          className="bg-popover text-popover-foreground border border-border"
        >
          Add Server
        </TooltipContent>
      </Tooltip>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div>
              {tab.invite ? (
                <DialogTitle className="text-2xl font-bold">
                  Join a Server
                </DialogTitle>
              ) : (
                <DialogTitle className="text-2xl font-bold">
                  Create Your Server
                </DialogTitle>
              )}
              {!tab.invite && (
                <DialogDescription className="mt-2 text-muted-foreground leading-relaxed">
                  Your server is where you and your friends hang out. Make yours
                  and start talking.
                </DialogDescription>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {tab.info && (
              <>
                <p className="text-sm text-muted-foreground">
                  Set up your server name and description.
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Server name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={serverForm.name}
                    onChange={handleChange}
                    placeholder="e.g. Gaming with friends"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Server description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    value={serverForm.description}
                    onChange={handleChange}
                    placeholder="What's this server about?"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCreateServer}
                    disabled={
                      serverForm.name.trim() === "" ||
                      serverForm.description.trim() === "" ||
                      isLoading
                    }
                  >
                    Create
                  </Button>
                </DialogFooter>
              </>
            )}

            {tab.tag && (
              <>
                <p className="text-xs font-semibold text-muted-foreground">
                  START FROM A TEMPLATE
                </p>
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {serverTag.map((tag, index) => (
                      <Button
                        key={index}
                        onClick={() => {
                          setServerForm((prev) => ({
                            ...prev,
                            tags: [tag],
                          }));
                          setTab({ ...allFalse, info: true });
                        }}
                        className="w-full flex justify-between px-4 py-3"
                      >
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <FontAwesomeIcon icon={tagIcon[tag]} />
                          </span>
                          <span className="text-base">{tag}</span>
                        </span>
                        <FontAwesomeIcon icon={faChevronRight} />
                      </Button>
                    ))}
                    <Button
                      onClick={() => {
                        setServerForm((prev) => ({ ...prev, tags: [] }));
                        setTab({ ...allFalse, info: true });
                      }}
                      className="w-full flex justify-between px-4 py-3"
                    >
                      <span className="text-base">No tag</span>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                  </div>
                </ScrollArea>
                <Separator className="my-4" />

                <div className="my-5 text-center">
                  <p className="text-lg font-semibold">
                    Have an invite already?
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setInviteLink("");
                    setTab({ ...allFalse, invite: true });
                  }}
                  className="w-full"
                >
                  Join a Server
                </Button>
              </>
            )}

            {tab.invite && (
              <>
                <h2 className="text-base font-semibold">Invite</h2>
                <p className="text-sm text-muted-foreground">
                  Join a server with an invite link.
                </p>
                <Input
                  type="text"
                  value={inviteLink}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInviteLink(e.target.value)
                  }
                  placeholder="Enter invite link"
                />
                <DialogFooter>
                  <Button onClick={() => setTab({ ...allFalse, tag: true })}>
                    Back
                  </Button>
                  <Button onClick={handleInvite} disabled={isLoading}>
                    Join Server
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
