"use client";

import { useParams } from "next/navigation";
import { getCookie } from "@/utils/cookie.utils";
import ServerBarItems from "@/components/serverBarItem";
import { useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faPlus,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

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

interface MemberInServerProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  avatar_ipfs_hash: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: [];
  is_active: boolean;
  wallets: [];
  __v: number;
  role: string;
  is_muted: boolean;
  joined_at: string;
}

interface CategoriesProps {
  server: ServerProps;
}

export default function Categories({ server }: CategoriesProps) {
  const { serverId } = useParams();
  const [userId, setUserId] = useState<string>("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [createChannelModal, setCreateChannelModal] = useState<
    Record<string, boolean>
  >({});
  const [categoryModal, setCategoryModal] = useState<Record<string, boolean>>(
    {}
  );
  const [channelForm, setChannelForm] = useState({
    name: "",
    type: "TEXT",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<
    Record<string, boolean>
  >({});
  const [editCategoryModal, setEditCategoryModal] = useState<
    Record<string, boolean>
  >({});
  const [channelPanel, setChannelPanel] = useState<Record<string, boolean>>({});
  // const [ channelModal, setChannelModal ] = useState<Record<string, boolean>>({})
  // console.log(category);

  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setUserId(userId);
    }
  }, []);

  const fetchMember = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
            member._id === userId
        );
        setIsPrivileged(isPrivileged);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch server member error");
    }
  }, [server._id, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchMember();
  }, [userId, fetchMember]);

  const fetchCategoryInfo = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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

      setCategoryModal((prev) =>
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

      // note: flatMap is combine between map and flat method
      // note: fromEntries turn pair of array like [[123, true], [456, true]] to pair of key value { 123: true, 456: true}
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
    try {
      const apiResponse = await fetch("/api/servers/channel/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
    }
  };

  if (loading) {
    return <h1>Loading ...</h1>;
  }

  const handleDeleteCategory = async (categoryId: string) => {
    // console.log("this is categories id", categoryId);
    try {
      const apiResponse = await fetch("/api/servers/category/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
    }
  };

  const handleChannelMove = async (
    channelId: string,
    targetCategoryId: string
  ) => {
    try {
      const apiResponse = await fetch("/api/servers/channel/move", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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

  return (
    <DndContext onDragEnd={OnDragEnd}>
      {categories.length > 0 &&
        categories.map((category) => (
          <div key={category._id}>
            <div
              onContextMenuCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
                // console.log("Test Mouse Right click");
                setCategoryModal((prev) => ({
                  ...prev,
                  [category._id]: !prev[category._id],
                }));
              }}
              className="relative group flex items-center justify-between px-3 py-1 rounded-md hover:bg-accent"
            >
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
                <button
                  onClick={() =>
                    setCreateChannelModal((prev) => ({
                      ...prev,
                      [category._id]: !prev[category._id],
                    }))
                  }
                  className="p-1 h-10 rounded bg-background text-foreground hover:bg-accent "
                  aria-label={`Create channel in ${category.name}`}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}

              {/* right mouse click category modal */}
              {categoryModal[category._id] && (
                <>
                  <div
                    role="dialog"
                    tabIndex={-1}
                    ref={(element: HTMLDivElement) => {
                      element?.focus();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setCategoryModal((prev) => ({
                          ...prev,
                          [category._id]: false,
                        }));
                      }
                    }}
                    onClick={() =>
                      setCategoryModal((prev) => ({
                        ...prev,
                        [category._id]: false,
                      }))
                    }
                    className="fixed inset-0 bg-black/50 z-40"
                  />

                  {/* <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50"> */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                    <div className="w-56 bg-background border border-border rounded-md shadow-xl overflow-hidden text-sm">
                      <div className="flex flex-col">
                        <button
                          onClick={() => {
                            setCategoryModal((prev) => ({
                              ...prev,
                              [category._id]: false,
                            }));

                            setOpen((prev) => ({
                              ...prev,
                              [category._id]: false,
                            }));
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-accent"
                        >
                          Collapse Category
                        </button>

                        <button
                          onClick={() => {
                            setCategoryModal((prev) => ({
                              ...prev,
                              [category._id]: false,
                            }));

                            setOpen(
                              Object.fromEntries(
                                categories.map((category) => [
                                  category._id,
                                  false,
                                ])
                              )
                            );
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-accent"
                        >
                          Collapse All Categories
                        </button>

                        {server.owner_id === userId && (
                          <>
                            <button
                              onClick={() => {
                                setCategoryModal((prev) => ({
                                  ...prev,
                                  [category._id]: false,
                                }));

                                setEditCategoryModal((prev) => ({
                                  ...prev,
                                  [category._id]: true,
                                }));
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-accent"
                            >
                              Edit Category
                            </button>

                            <button
                              onClick={() => {
                                setDeleteCategoryModal((prev) => ({
                                  ...prev,
                                  [category._id]: true,
                                }));

                                setCategoryModal((prev) => ({
                                  ...prev,
                                  [category._id]: false,
                                }));
                              }}
                              className="w-full text-left px-3 py-2 text-destructive hover:bg-accent"
                            >
                              Delete Category
                            </button>
                          </>
                        )}

                        <button
                          onClick={async (
                            event: React.MouseEvent<HTMLButtonElement>
                          ) => {
                            const button = event.currentTarget;
                            const oldText = button.textContent;
                            await navigator.clipboard.writeText(category._id);

                            button.textContent = "Copied!";
                            setTimeout(() => {
                              button.textContent = oldText;
                            }, 1000);
                          }}
                          className="w-full flex justify-between text-left px-3 py-2 hover:bg-accent"
                        >
                          Copy Category ID
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* edit category show category pannel*/}
            {editCategoryModal[category._id] && (
              <ServerBarItems.CategoryPanel
                category={category}
                fetchCategoryInfo={fetchCategoryInfo}
                setEditCategoryModal={setEditCategoryModal}
                handleDeleteCategory={handleDeleteCategory}
              />
            )}

            {/* deleted category */}
            {/* new knowledge the category right here if it is the dialog modal it will ingore the current and get the items when end of map */}
            {deleteCategoryModal[category._id] && (
              <div
                role="dialog"
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setDeleteCategoryModal((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                  }
                }}
                className="fixed inset-0 flex items-center justify-center z-30"
              >
                <div
                  onClick={() => {
                    setDeleteCategoryModal((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                  }}
                  className="fixed inset-0 bg-black/50 z-40"
                />

                <div className="bg-background text-foreground rounded-lg p-5 w-full max-w-md z-50 shadow-2xl border border-border">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold">Delete Category</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Are you sure you want to delete{" "}
                        <span className="font-bold">{category.name}</span>? This
                        action {"can't"} be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row justify-end gap-3 mt-5">
                    <button
                      onClick={() => {
                        setDeleteCategoryModal((prev) => ({
                          ...prev,
                          [category._id]: false,
                        }));
                      }}
                      className="px-3 py-2 rounded-md text-sm bg-muted text-foreground hover:opacity-90"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="px-3 py-2 rounded-md text-sm bg-destructive text-destructive-foreground hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    //     setChannelPannel={setChannelPanel}
                    //     fetchCategoryInfo={fetchCategoryInfo}
                    //     isPrivileged={isPrivileged}
                    //   />
                    // </div>
                    <ServerBarItems.ChannelDraggable
                      key={channel._id}
                      categoryId={category._id}
                      channel={channel}
                      channelPanel={channelPanel}
                      setChannelPannel={setChannelPanel}
                      fetchCategoryInfo={fetchCategoryInfo}
                      isPrivileged={isPrivileged}
                    />
                  ))}
              </ServerBarItems.CategoryDroppable>
            )}

            {createChannelModal[category._id] && (
              <div
                role="dialog"
                tabIndex={-1}
                // ref={(element: HTMLDivElement) => {
                //   element?.focus();
                // }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setCreateChannelModal((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                  }
                }}
                className="fixed inset-0 flex items-center justify-center z-30"
              >
                <div
                  onClick={() =>
                    setCreateChannelModal((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }))
                  }
                  className="fixed inset-0 bg-black/50 z-40"
                />
                <div className="bg-background text-foreground rounded-lg p-4 w-full max-w-md z-50 shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">Create Channel</h2>

                  <fieldset className="flex flex-col mb-3">
                    <legend className="text-sm font-medium text-muted-foreground mb-2">
                      Channel Type
                    </legend>

                    <div className="flex items-center gap-3 mb-2">
                      <input
                        id={`type-text-${category._id}`}
                        type="radio"
                        name="type"
                        value="TEXT"
                        checked={channelForm.type === "TEXT"}
                        onChange={handleChannelForm}
                        className="accent-[hsl(var(--primary))]"
                      />
                      <label
                        htmlFor={`type-text-${category._id}`}
                        className="text-sm"
                      >
                        Text
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id={`type-voice-${category._id}`}
                        type="radio"
                        name="type"
                        value="VOICE"
                        checked={channelForm.type === "VOICE"}
                        onChange={handleChannelForm}
                        className="accent-[hsl(var(--primary))]"
                      />
                      <label
                        htmlFor={`type-voice-${category._id}`}
                        className="text-sm"
                      >
                        Voice
                      </label>
                    </div>
                  </fieldset>

                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor={`channel-name-${category._id}`}
                      className="text-sm text-muted-foreground mb-1"
                    >
                      Channel name
                    </label>
                    <input
                      id={`channel-name-${category._id}`}
                      name="name"
                      type="text"
                      value={channelForm.name}
                      onChange={handleChannelForm}
                      autoFocus
                      className="w-full border border-border bg-background text-foreground rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-row gap-2 justify-end">
                    <button
                      onClick={() =>
                        setCreateChannelModal((prev) => ({
                          ...prev,
                          [category._id]: false,
                        }))
                      }
                      className="px-3 py-1 rounded text-sm text-muted-foreground hover:bg-accent/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleChannelCreate(category._id)}
                      className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
    </DndContext>
  );
}
