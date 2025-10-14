"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faFolder, faX } from "@fortawesome/free-solid-svg-icons";

export default function UserSetting() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--foreground)]">
        <aside className="flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] text-[var(--foreground)]">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  Vũ Trần Quang Minh
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Category Pannel Settings
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-3">
            <button>Overview</button>
            <button>Permissions</button>

            <div className="border-1 my-4 border-[var(--foreground)]" />

            <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]">
              Delete Category
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </nav>
        </aside>

        <section className="relative flex flex-1 flex-col bg-[var(--surface-primary)]">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-10 py-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"></p>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]"></h2>
            </div>

            <button>
              <span className="rounded-full border border-[var(--border-subtle)] p-2">
                <FontAwesomeIcon icon={faX} />
              </span>
              Esc
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-10 py-8">
            {false && (
              <div className="max-w-xl space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Category Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      // value={}
                      // onChange={}
                      autoFocus
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted-foreground)]">
                      <FontAwesomeIcon icon={faFolder} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {false && (
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
    </div>
  );
}
