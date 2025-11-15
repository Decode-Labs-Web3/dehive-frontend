"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useFingerprint } from "@/hooks/useFingerprint";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryProps } from "@/interfaces/server.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faFolder, faX } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CategoryPanelProps {
  category: CategoryProps;
  setEditCategoryModal: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleDeleteCategory: (categoryId: string) => void;
}

export default function CategoryPanel({
  category,
  setEditCategoryModal,
  handleDeleteCategory,
}: CategoryPanelProps) {
  const { fingerprintHash } = useFingerprint();
  const [panelValue, setPanelValue] = useState<string>("overview");
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: category.name,
  });
  const { updateCategoryRoot } = useServerRoot();
  const handleEditCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditCategoryForm({ name: event.target.value });
  };

  const categoryNameChange = editCategoryForm.name !== category.name;
  const [loading, setLoading] = useState(false);
  const handleEditCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/patch", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
        updateCategoryRoot(categoryId, editCategoryForm.name);
        setEditCategoryModal((prev) => ({
          ...prev,
          [categoryId]: true,
        }));
      }
    } catch (error) {
      console.error(error);
      console.log("Server edit category error");
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <Tabs
          value={panelValue}
          onValueChange={setPanelValue}
          orientation="vertical"
          className="flex h-full w-full"
        >
          {/* Sidebar */}
          <aside className="flex h-full w-64 flex-col border-r border-border">
            {/* Header */}
            <div className="px-6 pb-4 pt-6 shrink-0 border-b border-border bg-background">
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <FontAwesomeIcon icon={faFolder} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {editCategoryForm.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Category Settings
                  </p>
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
              </TabsList>
            </div>

            <div className="mt-2 shrink-0 px-3 pb-4">
              <div className="mb-4 h-px w-full bg-border" />
              <Button
                variant="destructive"
                className="w-full flex items-center justify-between px-3"
                onClick={() => setPanelValue("delete")}
              >
                Delete Category
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </aside>

          <section className="relative flex flex-1 flex-col bg-background">
            <header className="flex items-center justify-between border-b border-border px-10 py-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {panelValue === "permissions" ? "Permissions" : "Overview"}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  {panelValue === "permissions"
                    ? "Control who can access these channels"
                    : "Customize your category"}
                </h2>
              </div>

              <Button
                size="sm"
                disabled={categoryNameChange}
                onClick={() => {
                  if (categoryNameChange) return;
                  setEditCategoryModal((prev) => ({
                    ...prev,
                    [category._id]: false,
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
                        disabled={loading}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <FontAwesomeIcon icon={faFolder} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <div className="text-sm text-muted-foreground">
                  Permissions editor coming soon.
                </div>
              </TabsContent>
            </div>

            {categoryNameChange && (
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
                        onClick={() =>
                          setEditCategoryForm({ name: category.name })
                        }
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:opacity-90"
                        onClick={() => handleEditCategory(category._id)}
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
        open={panelValue === "delete"}
        onOpenChange={(open) => setPanelValue(open ? "delete" : "overview")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{category.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setPanelValue("overview")}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
              onClick={() => handleDeleteCategory(category._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return createPortal(content, document.body);
}
