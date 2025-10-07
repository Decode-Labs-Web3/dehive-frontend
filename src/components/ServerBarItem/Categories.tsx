"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faGear,
  faPlus,
  faHashtag,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

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

export default function Categories() {
  const { serverId } = useParams();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [modalCategory, setModalCategory] = useState<Record<string, boolean>>(
    {}
  );
  const [channelForm, setChannelForm] = useState({
    name: "",
    type: "TEXT",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  // console.log(category);

  const fetchCategoryInfo = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/category/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      setOpen(
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [category._id, true])
        )
      );

      setModalCategory(
        Object.fromEntries(
          response.data.map((category: CategoryProps) => [category._id, false])
        )
      );

      // note: fromEntries turn pair of array like [[123, true], [456, true]] to pair of key value { 123: true, 456: true}
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <h1>Loading ...</h1>;
  }

  return (
    <>
      {categories.length > 0 &&
        categories.map((category) => (
          <div key={category._id}>
            <div
              onContextMenuCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(
                  "dewjdwehdvwedvwejdvewjdwevdjewvdewjdvewjdvjewdvewjdhhew"
                );
              }}
              className="flex items-center justify-between px-3 py-1 rounded-md hover:bg-[var(--background-secondary)]"
            >
              <button
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                onClick={() =>
                  setOpen((prev) => ({
                    ...prev,
                    [category._id]: !prev[category._id],
                  }))
                }
              >
                <span className="select-none">{category.name}</span>
                <FontAwesomeIcon
                  icon={open[category._id] ? faChevronDown : faChevronRight}
                  className="text-[var(--muted-foreground)]"
                />
              </button>
              <button
                onClick={() =>
                  setModalCategory((prev) => ({
                    ...prev,
                    [category._id]: !prev[category._id],
                  }))
                }
                className="p-1 rounded hover:bg-[var(--background)]/10 text-[var(--accent)]"
                aria-label={`Create channel in ${category.name}`}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {open[category._id] && (
              <>
                {category.channels.length > 0 &&
                  category.channels.map((channel) => (
                    <div
                      key={channel._id}
                      className={
                        "flex items-center justify-between px-4 py-1 rounded-md hover:bg-[var(--background-secondary)] group"
                      }
                    >
                      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                        <FontAwesomeIcon
                          icon={
                            channel.type === "TEXT" ? faHashtag : faVolumeHigh
                          }
                          className="w-4 h-4 text-[var(--muted-foreground)]"
                        />
                        <p className="truncate text-sm">{channel.name}</p>
                      </div>
                      <button className="p-1 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100">
                        <FontAwesomeIcon icon={faGear} />
                      </button>
                    </div>
                  ))}
              </>
            )}

            {modalCategory[category._id] && (
              <div
                role="dialog"
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setModalCategory((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }));
                  }
                }}
                className="fixed inset-0 flex items-center justify-center z-30"
              >
                <div
                  onClick={() =>
                    setModalCategory((prev) => ({
                      ...prev,
                      [category._id]: false,
                    }))
                  }
                  className="fixed inset-0 bg-black/50 z-40"
                />
                <div className="bg-[var(--background-secondary)] text-[var(--foreground)] rounded-lg p-4 w-full max-w-md z-50 shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">Create Channel</h2>

                  <fieldset className="flex flex-col mb-3">
                    <legend className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
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
                        className="accent-[var(--accent)]"
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
                        className="accent-[var(--accent)]"
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
                      className="text-sm text-[var(--muted-foreground)] mb-1"
                    >
                      Channel name
                    </label>
                    <input
                      id={`channel-name-${category._id}`}
                      name="name"
                      type="text"
                      value={channelForm.name}
                      onChange={handleChannelForm}
                      className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-row gap-2 justify-end">
                    <button
                      onClick={() =>
                        setModalCategory((prev) => ({
                          ...prev,
                          [category._id]: false,
                        }))
                      }
                      className="px-3 py-1 rounded text-sm text-[var(--muted-foreground)] hover:bg-[var(--background)]/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleChannelCreate(category._id)}
                      className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--accent-foreground)] text-sm"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
    </>
  );
}
