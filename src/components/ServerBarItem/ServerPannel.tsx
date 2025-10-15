"use client";

import { useState } from "react";
import ServerBarItems from "./index";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faX } from "@fortawesome/free-solid-svg-icons";
import { useServerContext } from "@/contexts/ServerRefreshContext.contexts";

interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
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
  const { refreshServers } = useServerContext();

  const allFalse = {
    profile: false,
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
        refreshServers?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for delete server");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--foreground)]">
        <aside className="flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {editServerForm.name}
              </p>
            </div>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-3">
            <button
              onClick={() =>
                setServerPannelSetting({ ...allFalse, profile: true })
              }
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Server Profile
            </button>

            <button
              onClick={() =>
                setServerPannelSetting({ ...allFalse, members: true })
              }
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Members
            </button>

            <button
              onClick={() =>
                setServerPannelSetting({ ...allFalse, invites: true })
              }
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Invites
            </button>

            <button
              onClick={() => {
                setServerPannelSetting({ ...allFalse, role: true });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Role
            </button>

            <button
              onClick={() => {
                setServerPannelSetting({ ...allFalse, bans: true });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Bans
            </button>

            <div className="border-1 my-4 border-[var(--foreground)]" />

            <button
              onClick={() => {
                setServerPannelSetting({ ...allFalse, delete: true });
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
            >
              Delete Server
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </nav>
        </aside>

        <section className="relative flex flex-1 flex-col bg-[var(--surface-primary)]">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-10 py-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {true ? "Overview" : "Permissions"}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                {true
                  ? "Customize your channel"
                  : "Control who can access these channels"}
              </h2>
            </div>

            <button
              disabled={serverInfoChange}
              onClick={() => {
                if (serverInfoChange) return;
                setServerPannel(false);
                setServerSettingModal(false);
              }}
              className={`flex flex-col items-center gap-1 text-xs uppercase tracking-wide transition ${
                serverInfoChange
                  ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-60"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="rounded-full border border-[var(--border-subtle)] p-2">
                <FontAwesomeIcon icon={faX} />
              </span>
              Esc
            </button>
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
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                    >
                      Server Name
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        value={editServerForm.name}
                        onChange={handleEditServerChange}
                        autoFocus
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                      />
                    </div>
                  </div>
                </div>
                <div className="max-w-xl mt-4 space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                    >
                      Server Description
                    </label>
                    <div className="relative">
                      <input
                        id="description"
                        name="description"
                        value={editServerForm.description}
                        onChange={handleEditServerChange}
                        autoFocus
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {serverInfoChange && (
            <div className="pointer-events-auto absolute inset-x-8 bottom-6 rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-6 py-4 text-sm text-[var(--foreground)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Careful — you have unsaved changes!
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Save or reset your edits before closing this panel.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    onClick={() => {
                      setEditServerForm({
                        name: server.name,
                        description: server.description,
                      });
                    }}
                    className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleEditServer}
                    className="rounded-lg bg-[var(--success)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {serverPannelSetting.delete && (
        <div
          role="dialog"
          className="fixed inset-0 z-[102] flex items-center justify-center"
        >
          <div
            onClick={() =>
              setServerPannelSetting((prev) => ({
                ...prev,
                delete: false,
                profile: true,
              }))
            }
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <div className="relative w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5 z-[120]">
            <h1 className="text-base font-semibold mb-1">Delete Server</h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Please type the name of {`"${server.name}"`} to confirm.
            </p>
            <input
              id="name"
              name="name"
              value={deleteServerForm.name}
              onChange={handleDeleteServerChange}
              className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />

            <div className="flex flex-row justify-end gap-2">
              <button
                onClick={() =>
                  setServerPannelSetting((prev) => ({
                    ...prev,
                    delete: false,
                    profile: true,
                  }))
                }
                className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteServer}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
