"use client";

import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import ServerBarItems from "@/components/server-bar";
import { useFingerprint } from "@/hooks/useFingerprint";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberInServerProps } from "@/interfaces/user.interface";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CategoryProps, ServerProps } from "@/interfaces/server.interface";
import {
  faChevronRight,
  faChevronDown,
  faPlus,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface CategoriesProps {
  server: ServerProps;
}

export default function Categories({ server }: CategoriesProps) {
  const { user } = useUser();
  const { serverId } = useParams();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [channelPanel, setChannelPanel] = useState<Record<string, boolean>>({});
  const [createChannelModal, setCreateChannelModal] = useState<
    Record<string, boolean>
  >({});
  const [channelForm, setChannelForm] = useState({
    name: "",
    type: "TEXT",
  });
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<
    Record<string, boolean>
  >({});
  const [editCategoryModal, setEditCategoryModal] = useState<
    Record<string, boolean>
  >({});
  // const [ channelModal, setChannelModal ] = useState<Record<string, boolean>>({})
  // console.log(category);

  const fetchMember = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId: server._id }),
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
        const isPrivileged = response.data.some(
          (member: MemberInServerProps) =>
            (member.role === "owner" || member.role === "moderator") &&
            member._id === user._id
        );
        setIsPrivileged(isPrivileged);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch server member error");
    }
  }, [server._id, user._id]);

  useEffect(() => {
    if (!user._id) return;
    fetchMember();
  }, [user._id, fetchMember]);

  const fetchCategoryInfo = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/get", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setCategories(response.data);
      setOpen((prev) =>
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [
            category._id,
            prev[category._id] ?? true,
          ])
        )
      );

      setCreateChannelModal((prev) =>
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [
            category._id,
            prev[category._id] ?? false,
          ])
        )
      );

      setDeleteCategoryModal((prev) =>
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [
            category._id,
            prev[category._id] ?? false,
          ])
        )
      );

      setEditCategoryModal((prev) =>
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [
            category._id,
            prev[category._id] ?? false,
          ])
        )
      );

      setChannelPanel((prev) =>
        Object.fromEntries(
          response.data.flatMap((category: CategoryProps) =>
            category.channels.map((channel) => [
              channel._id,
              prev[channel._id] ?? false,
            ])
          )
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchCategoryInfo();
  }, [fetchCategoryInfo]);

  const handleChannelForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChannelForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleChannelCreate = async (categoryId: string) => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/channel/post", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          serverId,
          categoryId: categoryId,
          name: channelForm.name,
          type: channelForm.type,
        }),
        cache: "no-store",
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
        fetchCategoryInfo();
        setCreateChannelModal((prev) => ({
          ...prev,
          [categoryId]: false,
        }));
        setChannelForm({
          name: "",
          type: "TEXT",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // console.log("this is categories id", categoryId);
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/delete", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ categoryId }),
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
        setDeleteCategoryModal((prev) => ({
          ...prev,
          [categoryId]: false,
        }));

        setEditCategoryModal((prev) => ({
          ...prev,
          [categoryId]: false,
        }));

        fetchCategoryInfo();
      }
    } catch (error) {
      console.error(error);
      console.log("server delete category error");
    } finally {
      setLoading(false);
    }
  };

  const handleChannelMove = async (
    channelId: string,
    targetCategoryId: string
  ) => {
    try {
      const apiResponse = await fetch("/api/servers/channel/move", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ channelId, targetCategoryId }),
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
        // fetchCategoryInfo();
        console.log("moving channel successfully, slient move");
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for moving channel");
    }
  };

  const OnDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!isPrivileged) return;
    if (!over) return;
    const channelId = String(active.id);
    const sourceCategoryId = String(active.data.current?.categoryId);
    const targetCategoryId = String(over.id);
    if (
      !channelId ||
      !sourceCategoryId ||
      sourceCategoryId === targetCategoryId
    )
      return;

    setCategories((prev: CategoryProps[]) =>
      prev.map((category: CategoryProps) => {
        if (category._id === sourceCategoryId) {
          return {
            ...category,
            channels: category.channels.filter(
              (prevChannel) => prevChannel._id !== channelId
            ),
          };
        }
        if (category._id === targetCategoryId) {
          const moved = prev
            .find((prevCategory) => prevCategory._id === sourceCategoryId)
            ?.channels.find((prevChannel) => prevChannel._id === channelId);
          return moved
            ? {
                ...category,
                channels: [
                  ...category.channels,
                  { ...moved, category_id: targetCategoryId },
                ],
              }
            : category;
        }
        return category;
      })
    );

    try {
      await handleChannelMove(channelId, targetCategoryId);
    } catch (error) {
      console.error(error);
      fetchCategoryInfo();
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, categoryIndex) => (
          <div key={categoryIndex} className="space-y-1">
            {/* Category Header */}
            <div className="relative group flex items-center justify-between px-3 py-1 rounded-md">
              <div className="flex h-10 justify-between w-full items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-4 h-4" />
              </div>
              <Skeleton className="w-8 h-8 rounded" />
            </div>

            <div className="ml-4 space-y-1">
              {Array.from({ length: 4 }).map((_, channelIndex) => (
                <div
                  key={channelIndex}
                  className="group flex items-center w-full px-3 py-2 rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext onDragEnd={OnDragEnd}>
      {categories.length > 0 &&
        categories.map((category) => (
          <div key={category._id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="relative group flex items-center justify-between px-3 py-1 rounded-md hover:bg-accent">
                  <button
                    className="flex h-10 justify-between w-full items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    onClick={() =>
                      setOpen((prev) => ({
                        ...prev,
                        [category._id]: !prev[category._id],
                      }))
                    }
                  >
                    <span>{category.name}</span>
                    <FontAwesomeIcon
                      icon={open[category._id] ? faChevronDown : faChevronRight}
                      className="text-muted-foreground"
                    />
                  </button>

                  {isPrivileged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCreateChannelModal((prev) => ({
                          ...prev,
                          [category._id]: !prev[category._id],
                        }))
                      }
                      className="h-10 w-10 p-0"
                      aria-label={`Create channel in ${category.name}`}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                <ContextMenuItem
                  onClick={() => {
                    setOpen((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                  }}
                >
                  Collapse Category
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setOpen(
                      Object.fromEntries(
                        categories.map((category) => [category._id, false])
                      )
                    );
                  }}
                >
                  Collapse All Categories
                </ContextMenuItem>
                {server.owner_id === user._id && (
                  <>
                    <ContextMenuItem
                      onClick={() => {
                        setEditCategoryModal((prev) => ({
                          ...prev,
                          [category._id]: true,
                        }));
                      }}
                    >
                      Edit Category
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setDeleteCategoryModal((prev) => ({
                          ...prev,
                          [category._id]: true,
                        }));
                      }}
                    >
                      Delete Category
                    </ContextMenuItem>
                  </>
                )}
                <ContextMenuItem
                  onClick={async (event) => {
                    const button = event.currentTarget;
                    const oldText = button.textContent;
                    await navigator.clipboard.writeText(category._id);
                    button.textContent = "Copied!";
                    setTimeout(() => {
                      button.textContent = oldText;
                    }, 1000);
                  }}
                >
                  Copy Category ID
                  <FontAwesomeIcon icon={faCopy} />
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            {/* edit category show category panel*/}
            {editCategoryModal[category._id] && (
              <ServerBarItems.CategoryPanel
                category={category}
                fetchCategoryInfo={fetchCategoryInfo}
                setEditCategoryModal={setEditCategoryModal}
                handleDeleteCategory={handleDeleteCategory}
              />
            )}

            {/* deleted category */}
            <Dialog
              open={deleteCategoryModal[category._id]}
              onOpenChange={(open) => {
                if (!open)
                  setDeleteCategoryModal((prev) => ({
                    ...prev,
                    [category._id]: false,
                  }));
              }}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Category</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete{" "}
                    <span className="font-bold">{category.name}</span>? This
                    action can't be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteCategoryModal((prev) => ({
                        ...prev,
                        [category._id]: false,
                      }));
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category._id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* create channal */}
            {open[category._id] && (
              <ServerBarItems.CategoryDroppable
                category={category}
                isOpen={open[category._id]}
              >
                {category.channels.length > 0 &&
                  category.channels.map((channel) => (
                    // <div key={channel._id}>
                    //   <ServerBarItems.Channels
                    //     channel={channel}
                    //     channelPanel={channelPanel}
                    //     setChannelPanel={setChannelPanel}
                    //     fetchCategoryInfo={fetchCategoryInfo}
                    //     isPrivileged={isPrivileged}
                    //   />
                    // </div>
                    <ServerBarItems.ChannelDraggable
                      key={channel._id}
                      categoryId={category._id}
                      channel={channel}
                      channelPanel={channelPanel}
                      setChannelPanel={setChannelPanel}
                      fetchCategoryInfo={fetchCategoryInfo}
                      isPrivileged={isPrivileged}
                    />
                  ))}
              </ServerBarItems.CategoryDroppable>
            )}

            {createChannelModal[category._id] && (
              <Dialog
                open={createChannelModal[category._id]}
                onOpenChange={(open) => {
                  if (!open)
                    setCreateChannelModal((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                }}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor={`type-text-${category._id}`}
                        className="text-right"
                      >
                        Type
                      </Label>
                      <div className="col-span-3">
                        <RadioGroup
                          value={channelForm.type}
                          onValueChange={(value) =>
                            setChannelForm((prev) => ({
                              ...prev,
                              type: value as "TEXT" | "VOICE",
                            }))
                          }
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="TEXT"
                              id={`type-text-${category._id}`}
                            />
                            <Label htmlFor={`type-text-${category._id}`}>
                              Text
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="VOICE"
                              id={`type-voice-${category._id}`}
                            />
                            <Label htmlFor={`type-voice-${category._id}`}>
                              Voice
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor={`channel-name-${category._id}`}
                        className="text-right"
                      >
                        Name
                      </Label>
                      <Input
                        id={`channel-name-${category._id}`}
                        name="name"
                        value={channelForm.name}
                        onChange={handleChannelForm}
                        className="col-span-3"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCreateChannelModal((prev) => ({
                          ...prev,
                          [category._id]: false,
                        }))
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleChannelCreate(category._id)}
                      disabled={loading}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ))}
    </DndContext>
  );
}
