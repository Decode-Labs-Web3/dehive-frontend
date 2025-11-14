"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import ServerBarItems from "@/components/server-bar";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useFingerprint } from "@/hooks/useFingerprint";
import { ServerProps } from "@/interfaces/server.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { useServerRefresh } from "@/contexts/ServerRefreshContext.contexts";
import {
  faPen,
  faGear,
  faCopy,
  faTrash,
  faUserPlus,
  faFolderPlus,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditModalProps {
  server: ServerProps;
  setServerPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setServerSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditModal({
  server,
  setServerPanel,
  setServerSettingModal,
}: EditModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const { updateServerInfomation } = useServerInfomation();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const { triggerRefeshServer } = useServerRefresh();
  const { createCategory } = useServerRoot();
  // const [server, setServer] = useState<ServerProps>(server)
  const allFalse = {
    edit: false,
    leave: false,
    invite: false,
    delete: false,
    category: false,
  };
  const [modal, setModal] = useState<Record<string, boolean>>({ ...allFalse });

  const [editServerForm, setEditServerForm] = useState({
    name: server.name,
    description: server.description,
  });

  const [deleteServerForm, setDeleteServerFrom] = useState({
    name: "",
  });

  const [createCategoryForm, setCreateCategoryFrom] = useState({
    name: "",
  });

  const handleCreateCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreateCategoryFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDeleteServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDeleteServerFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditServer = async () => {
    const name = editServerForm.name.trim();
    const description = editServerForm.description.trim();

    const missing = name === "" || description === "";
    const nothingChanged =
      name === server.name && description === server.description;

    if (missing || nothingChanged) return;

    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/patch", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
      // console.log("this is response from edit server", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        setModal({
          ...allFalse,
        });
        updateServerInfomation(editServerForm.name, editServerForm.description);
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for edit server");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (deleteServerForm.name.trim() !== server.name) {
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/delete", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
        setModal({ ...allFalse });
        router.push("/app/channels/me");
        triggerRefeshServer?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for delete server");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveServer = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/members/leave-server", {
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
      console.log("hello this is response", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        setModal({ ...allFalse });
        triggerRefeshServer?.();
        router.push("/app/channels/me");
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for leave server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (createCategoryForm.name.trim() === "") return;
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/post", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          serverId: server._id,
          name: createCategoryForm.name,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        createCategory(response.data);
        setModal({ ...allFalse });
        setServerSettingModal(false);
      }
    } catch (error) {
      console.log(error);
      console.error("Server error create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        role="dialog"
        tabIndex={-1}
        ref={(el) => {
          if (
            el &&
            !(
              modal.edit ||
              modal.delete ||
              modal.leave ||
              modal.category ||
              modal.invite
            )
          )
            el.focus();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
            !(
              modal.edit ||
              modal.delete ||
              modal.leave ||
              modal.category ||
              modal.invite
            )
          ) {
            setServerSettingModal(false);
          }
        }}
        // ref={(element: HTMLDivElement) => {
        //   element?.focus();
        // }}
        // onKeyDown={(event) => {
        //   if (event.key === "Escape") {
        //     setModal((prev) => ({ ...prev, leave: false }));
        //   }
        // }}
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 z-30 rounded-md bg-background text-foreground border border-border shadow-lg overflow-hidden"
      >
        <button
          onClick={() => {
            setModal({ ...allFalse, invite: true });
          }}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent"
        >
          Invite Friend
          <FontAwesomeIcon icon={faUserPlus} />
        </button>

        {server.owner_id !== user._id && (
          <button
            onClick={() => {
              setModal({ ...allFalse, leave: true });
            }}
            className="w-full px-3 py-2 flex items-center justify-between text-destructive hover:bg-destructive/10"
          >
            Leave Server
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        )}

        {server.owner_id === user._id && (
          <>
            <button
              onClick={() => {
                setModal({ ...allFalse, category: true });
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent"
            >
              Create Category
              <FontAwesomeIcon icon={faFolderPlus} />
            </button>

            <button
              onClick={() => {
                setServerPanel(true);
                setModal({
                  invite: false,
                  edit: false,
                  leave: false,
                  delete: false,
                  category: false,
                });
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent"
            >
              Server Setting
              <FontAwesomeIcon icon={faGear} />
            </button>

            <button
              onClick={() => {
                setModal({ ...allFalse, edit: true });
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent"
            >
              Edit Server
              <FontAwesomeIcon icon={faPen} />
            </button>

            <button
              onClick={() => {
                setModal({ ...allFalse, delete: true });
              }}
              className="w-full px-3 py-2 flex items-center justify-between text-destructive hover:bg-destructive/10"
            >
              Delete Server
              <FontAwesomeIcon icon={faTrash} />
            </button>

            <button
              onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
                const button = event.currentTarget;
                const oldText = button.textContent;

                await navigator.clipboard.writeText(server._id);

                button.textContent = "Copied!";

                setTimeout(() => {
                  button.textContent = oldText;
                }, 1000);
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent"
            >
              Copy Server ID
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <Dialog
        open={modal.edit}
        onOpenChange={(open) => {
          if (!open) setModal({ ...allFalse, edit: false });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit your server</DialogTitle>
            <DialogDescription>
              Update your server name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Server name
              </Label>
              <Input
                id="name"
                name="name"
                value={editServerForm.name}
                onChange={handleEditServerChange}
                className="col-span-3"
                placeholder="Write your title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={editServerForm.description}
                onChange={handleEditServerChange}
                className="col-span-3"
                placeholder="Write your description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setServerSettingModal(false);
                setModal({ ...allFalse, edit: false });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditServer}
              disabled={
                editServerForm.name.trim() === "" ||
                editServerForm.description.trim() === "" ||
                loading
              }
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modal.delete}
        onOpenChange={(open) => {
          if (!open) setModal({ ...allFalse, delete: false });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              Please type the name of &quot;{server.name}&quot; to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delete-name" className="text-right">
                Server name
              </Label>
              <Input
                id="delete-name"
                name="name"
                value={deleteServerForm.name}
                onChange={handleDeleteServerChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setServerSettingModal(false);
                setModal({ ...allFalse, delete: false });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteServer}
              disabled={loading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modal.leave}
        onOpenChange={(open) => {
          if (!open) setModal({ ...allFalse, leave: false });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave {server.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {server.name}? You won&apos;t be
              able to rejoin this server unless you are re-invited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setServerSettingModal(false);
                setModal({ ...allFalse, leave: false });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveServer}
              disabled={loading}
            >
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modal.category}
        onOpenChange={(open) => {
          if (!open) setModal({ ...allFalse, category: false });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Name
              </Label>
              <Input
                id="category-name"
                name="name"
                value={createCategoryForm.name}
                onChange={handleCreateCategoryChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setServerSettingModal(false);
                setModal({ ...allFalse, category: false });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={loading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modal.invite && (
        <>
          <ServerBarItems.ServerInvite server={server} setModal={setModal} />
        </>
      )}
    </>
  );
}
