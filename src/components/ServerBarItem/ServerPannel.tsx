"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faHashtag,
  faVolumeHigh,
  faX,
} from "@fortawesome/free-solid-svg-icons";

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
}

export default function ServerPannel({ server }: ServerPannel) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--foreground)]">
        <aside className="flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] text-[var(--foreground)]">
                <FontAwesomeIcon
                  icon={"TEXT" === "TEXT" ? faHashtag : faVolumeHigh}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  QUANG MINH
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Channel Pannel Settings
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-3">
            <button
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Overview
            </button>

            <button
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Permissions
            </button>

            <button
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Invites
            </button>

            <button
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                true
                  ? "bg-[var(--surface-active)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Integrations
            </button>

            <div className="border-1 my-4 border-[var(--foreground)]" />

            <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]">
              Delete Channel
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
              className={`flex flex-col items-center gap-1 text-xs uppercase tracking-wide transition ${
                true
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
            {true && (
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
                      autoFocus
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted-foreground)]">
                      <FontAwesomeIcon
                        icon={"TEXT" === "TEXT" ? faHashtag : faVolumeHigh}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {true && (
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
                  <button className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]">
                    Reset
                  </button>
                  <button className="rounded-lg bg-[var(--success)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition hover:opacity-90">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {true && (
        <div
          role="dialog"
          className="fixed inset-0 z-[102] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[var(--overlay)]" />

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
                    Vũ Trần Quang Minh
                  </span>
                  ? This can&apos;t be undone and all channels inside will be
                  removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:opacity-90">
                Cancel
              </button>
              <button className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
