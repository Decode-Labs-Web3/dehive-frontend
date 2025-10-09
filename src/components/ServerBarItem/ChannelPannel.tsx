"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faHashtag,
  faVolumeHigh,
  faX,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChannelPannelProps {
  channel: ChannelProps;
  fetchCategoryInfo: () => void;
  handleDeleteChannel: (channelId: string) => void;
  setChannelPannel: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChannelPannel({
  channel,
  setChannelPannel,
  fetchCategoryInfo,
  handleDeleteChannel,
}: ChannelPannelProps) {
  const allFalse = {
    overview: false,
    permissions: false,
    invites: false,
    integrations: false,
  };
  const [editChannelForm, setEditChannelForm] = useState({
    name: channel.name,
  });
  const [tabOption, setTabOption] = useState({ ...allFalse, overview: true });
  const [deleteChannelModal, setDeleteChannelModal] = useState(false);

  const handleEditChannelChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditChannelForm({ name: event.target.value });
  };

  const channelNameChange = editChannelForm.name !== channel.name;
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (channelNameChange) return;
      if (e.key !== "Escape") return;
      if (deleteChannelModal) {
        e.preventDefault();
        setDeleteChannelModal(false);
        return;
      }
      setChannelPannel(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [deleteChannelModal, channel._id, channelNameChange, setChannelPannel]);

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
        // Panel vẫn mở, không cần set lại
      }
    } catch (error) {
      console.error(error);
      console.log("Server edit channel error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--foreground)]">
        <aside className="flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] text-[var(--foreground)]">
                <FontAwesomeIcon
                  icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {editChannelForm.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Channel Pannel Settings
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-3">
            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  overview: true,
                });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                tabOption.overview
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Overview
              {tabOption.overview && (
                <span className="rounded-full bg-[var(--success)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-foreground)]">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  permissions: true,
                });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                tabOption.permissions
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Permissions
              {tabOption.permissions && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-foreground)]">
                  Beta
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  invites: true,
                });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                tabOption.invites
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Invites
              {tabOption.invites && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-foreground)]">
                  Beta
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setTabOption({
                  ...allFalse,
                  integrations: true,
                });
              }}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                tabOption.integrations
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Integrations
              {tabOption.integrations && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-foreground)]">
                  Beta
                </span>
              )}
            </button>

            <div className="border-1 my-4 border-[var(--foreground)]" />

            <button
              onClick={() => {
                setDeleteChannelModal(true);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
            >
              Delete Channel
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </nav>
        </aside>

        <section className="relative flex flex-1 flex-col bg-[var(--surface-primary)]">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-10 py-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {tabOption.overview ? "Overview" : "Permissions"}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                {tabOption.overview
                  ? "Customize your channel"
                  : "Control who can access these channels"}
              </h2>
            </div>

            <button
              disabled={channelNameChange}
              onClick={() => {
                if (channelNameChange) return;
                setChannelPannel(false);
              }}
              className={`flex flex-col items-center gap-1 text-xs uppercase tracking-wide transition ${
                channelNameChange
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
            {tabOption.overview && (
              <div className="max-w-xl space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Channel Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      value={editChannelForm.name}
                      onChange={handleEditChannelChange}
                      autoFocus
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted-foreground)]">
                      <FontAwesomeIcon
                        icon={
                          channel.type === "TEXT" ? faHashtag : faVolumeHigh
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {channelNameChange && (
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
                      setEditChannelForm({ name: channel.name });
                    }}
                    className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => handleEditChannel(channel._id)}
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

      {deleteChannelModal && (
        <div
          role="dialog"
          className="fixed inset-0 z-[102] flex items-center justify-center"
        >
          <div
            onClick={() => {
              setDeleteChannelModal(false);
            }}
            className="absolute inset-0 bg-[var(--overlay)]"
          />

          <div className="relative z-[103] w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-6 text-[var(--foreground)] shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[var(--danger-soft)] p-3 text-[var(--danger)]">
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">Delete Channel</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[var(--foreground)]">
                    {channel.name}
                  </span>
                  ? This can&apos;t be undone and all channels inside will be
                  removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteChannelModal(false);
                }}
                className="rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChannel(channel._id)}
                className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
