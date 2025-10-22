"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faFolder, faX } from "@fortawesome/free-solid-svg-icons";

interface CategoryProps {
  _id: string;
  name: string;
  server_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  channels: ChannelProps[];
}

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CategoryPanelProps {
  category: CategoryProps;
  setEditCategoryModal: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleDeleteCategory: (categoryId: string) => void;
  fetchCategoryInfo: () => void;
}

export default function CategoryPanel({
  category,
  setEditCategoryModal,
  handleDeleteCategory,
  fetchCategoryInfo,
}: CategoryPanelProps) {
  const allFalse = { overview: false, permissions: false };
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: category.name,
  });
  const [tabOption, setTabOption] = useState({ ...allFalse, overview: true });
  const [deleteCategoryModal, setDeleteCategoryModal] = useState(false);

  const handleEditCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditCategoryForm({ name: event.target.value });
  };

  const categoryNameChange = editCategoryForm.name !== category.name;
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (categoryNameChange) return;
      if (e.key !== "Escape") return;
      if (deleteCategoryModal) {
        e.preventDefault();
        setDeleteCategoryModal(false);
        return;
      }
      setEditCategoryModal((prev) => ({ ...prev, [category._id]: false }));
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [
    deleteCategoryModal,
    category._id,
    setEditCategoryModal,
    categoryNameChange,
  ]);

  const handleEditCategory = async (categoryId: string) => {
    try {
      const apiResponse = await fetch("/api/servers/category/patch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          categoryId,
          name: editCategoryForm.name,
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
        setEditCategoryModal((prev) => ({
          ...prev,
          [categoryId]: true,
        }));
      }
    } catch (error) {
      console.error(error);
      console.log("Server edit category error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <aside className="flex w-64 flex-col border-r border-border bg-secondary">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {editCategoryForm.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Category Pannel Settings
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
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Overview
              {tabOption.overview && (
                <span className="rounded-full bg-[hsl(var(--success))] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[hsl(var(--success-foreground))]">
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
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Permissions
              {tabOption.permissions && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                  Beta
                </span>
              )}
            </button>

            <div className="my-4 border border-foreground" />

            <button
              onClick={() => {
                setDeleteCategoryModal(true);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              Delete Category
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </nav>
        </aside>

        <section className="relative flex flex-1 flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border px-10 py-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tabOption.overview ? "Overview" : "Permissions"}
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                {tabOption.overview
                  ? "Customize your category"
                  : "Control who can access these channels"}
              </h2>
            </div>

            <button
              disabled={categoryNameChange}
              onClick={() => {
                if (categoryNameChange) return;
                setEditCategoryModal((prev) => ({
                  ...prev,
                  [category._id]: false,
                }));
              }}
              className={`flex flex-col items-center gap-1 text-xs uppercase tracking-wide transition ${
                categoryNameChange
                  ? "cursor-not-allowed text-muted-foreground opacity-60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="rounded-full border border-border p-2">
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
                    className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Category Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      value={editCategoryForm.name}
                      onChange={handleEditCategoryChange}
                      autoFocus
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                      <FontAwesomeIcon icon={faFolder} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {categoryNameChange && (
            <div className="pointer-events-auto absolute inset-x-8 bottom-6 rounded-2xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 px-6 py-4 text-sm text-foreground">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Careful — you have unsaved changes!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Save or reset your edits before closing this panel.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    onClick={() => {
                      setEditCategoryForm({ name: category.name });
                    }}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => handleEditCategory(category._id)}
                    className="rounded-lg bg-[hsl(var(--success))] px-4 py-2 text-xs font-semibold text-[hsl(var(--success-foreground))] transition hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {deleteCategoryModal && (
        <div
          role="dialog"
          className="fixed inset-0 z-[102] flex items-center justify-center"
        >
          <div
            onClick={() => {
              setDeleteCategoryModal(false);
            }}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative z-[103] w-full max-w-md rounded-3xl border border-border bg-background p-6 text-foreground shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">Delete Category</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {category.name}
                  </span>
                  ? This can&apos;t be undone and all channels inside will be
                  removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteCategoryModal(false);
                }}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteCategory(category._id);
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
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
