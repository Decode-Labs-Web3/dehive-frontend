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

  const handleChannelCreate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChannelForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
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
              className="flex flex-row justify-between"
            >
              <button
                className="flex flex-row items-center justify-center gap-2"
                onClick={() =>
                  setOpen((prev) => ({
                    ...prev,
                    [category._id]: !prev[category._id],
                  }))
                }
              >
                {category.name}
                <FontAwesomeIcon
                  icon={open[category._id] ? faChevronDown : faChevronRight}
                />
              </button>
              <button
                onClick={() =>
                  setModalCategory((prev) => ({
                    ...prev,
                    [category._id]: !prev[category._id],
                  }))
                }
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
                      className={"flex flex-row justify-between"}
                    >
                      <div className="flex flex-row gap-2">
                        <FontAwesomeIcon
                          icon={
                            channel.type === "TEXT" ? faHashtag : faVolumeHigh
                          }
                        />
                        <p>{channel.name}</p>
                      </div>
                      <button>
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
                <div className="w-100 h100 bg-red-500 z-50">
                  <h1>Create Channel</h1>

                  <fieldset className="flex flex-col">
                    <legend>Channel Type</legend>

                    <div className="flex flex-row gap-2">
                      <input
                        id="type-text"
                        type="radio"
                        name="type"
                        value="TEXT"
                        checked={channelForm.type === "TEXT"}
                        onChange={handleChannelCreate}
                      />
                      <label htmlFor="type-text">Text</label>
                    </div>

                    <div className="flex flex-row gap-2">
                      <input
                        id="type-voice"
                        type="radio"
                        name="type"
                        value="VOICE"
                        checked={channelForm.type === "VOICE"}
                        onChange={handleChannelCreate}
                      />
                      <label htmlFor="type-voice">Voice</label>
                    </div>
                  </fieldset>

                  <div className="flex flex-col">
                    <label htmlFor="channel-name">Channel name</label>
                    <input
                      id="channel-name"
                      name="name"
                      type="text"
                      value={channelForm.name}
                      onChange={handleChannelCreate}
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
                    >
                      Cancel
                    </button>
                    <button>Create</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
    </>
  );
}
