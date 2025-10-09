"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toastSuccess, toastError, getCookie } from "@/utils/index.utils";
import { useServerContext } from "@/contexts/ServerRefreshContext.contexts";
import {
  faUserPlus,
  faPen,
  faTrash,
  faRightFromBracket,
  faGear,
  faFolderPlus,
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

interface EditModalProps {
  server: ServerProps;
  setServerSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
  fetchServerInfo: () => void;
}

export default function EditModal({
  server,
  setServerSettingModal,
  fetchServerInfo,
}: EditModalProps) {
  // const [server, setServer] = useState<ServerProps>(server)
  const router = useRouter();
  const { refreshServers } = useServerContext();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const value = getCookie("userId");
    if (value) {
      setUserId(value);
    }
  }, []);

  const [modal, setModal] = useState({
    edit: false,
    delete: false,
    leave: false,
    category: false,
  });

  const [editServerForm, setEditServerForm] = useState({
    name: server.name,
    description: server.description,
  });

  const [deleteServerForm, setDeleteServerFrom] = useState({
    name: "",
  });

  const [createCategoryForm, setCreateCategoryFrom] = useState({
    name: "",
  });

  const handleCreateCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreateCategoryFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDeleteServerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDeleteServerFrom(() => ({
      [event.target.name]: event.target.value,
    }));
  };

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
        setModal((prev) => ({
          ...prev,
          edit: false,
        }));
        fetchServerInfo?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for leave server");
    }
  };

  const handleDeleteServer = async () => {
    if (deleteServerForm.name.trim() !== server.name) {
      toastError("The type the server name didn't macth");
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
        toastSuccess("Delete Successful");
        setModal((prev) => ({
          ...prev,
          delete: false,
        }));
        router.push("/app/channels/me");
        refreshServers?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for delete server");
    }
  };

  const handleLeaveServer = () => {
    setModal((prev) => ({
      ...prev,
      leave: false,
    }));
    console.log("Leave server");
  };

  const handleCreateCategory = async () => {
    if (createCategoryForm.name.trim() === "") return;
    try {
      const apiResponse = await fetch("/api/servers/category/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          serverId: server._id,
          name: createCategoryForm.name,
        }),
        cache: "no-cache",
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
        setModal((prev) => ({
          ...prev,
          category: false,
        }));
        fetchServerInfo();
      }
    } catch (error) {
      console.log(error);
      console.error("Server error create category");
    }
  };

  return (
    <>
      <div
        role="dialog"
        tabIndex={-1}
        ref={(el) => {
          if (
            el &&
            !(modal.edit || modal.delete || modal.leave || modal.category)
          )
            el.focus();
        }}
        onKeyDown={(e) => {
          if (
            e.key === "Escape" &&
            !(modal.edit || modal.delete || modal.leave || modal.category)
          ) {
            setServerSettingModal(false);
          }
        }}
        // ref={(element: HTMLDivElement) => {
        //   element?.focus();
        // }}
        // onKeyDown={(event) => {
        //   if (event.key === "Escape") {
        //     setModal((prev) => ({ ...prev, leave: false }));
        //   }
        // }}
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 z-30 rounded-md bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-lg overflow-hidden"
      >
        <button className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]">
          Invite Friend
          <FontAwesomeIcon icon={faUserPlus} />
        </button>

        <button
          onClick={() => setModal((prev) => ({ ...prev, leave: true }))}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]"
        >
          Leave Server
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>

        {server.owner_id === userId && (
          <>
            <button
              onClick={() => setModal((prev) => ({ ...prev, category: true }))}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]"
            >
              Create Category
              <FontAwesomeIcon icon={faFolderPlus} />
            </button>

            <button className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]">
              Server Setting
              <FontAwesomeIcon icon={faGear} />
            </button>

            <button
              onClick={() => setModal((prev) => ({ ...prev, edit: true }))}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]"
            >
              Edit Server
              <FontAwesomeIcon icon={faPen} />
            </button>

            <button
              onClick={() => setModal((prev) => ({ ...prev, delete: true }))}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--background-secondary)]"
            >
              Delete Server
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </>
        )}
      </div>

      {modal.edit && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({ ...prev, edit: false }));
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <div className="relative w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5 z-50">
            <h1 className="text-base font-semibold mb-1">Edit your server</h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Update your server name and description.
            </p>

            <label
              htmlFor="name"
              className="text-sm text-[var(--muted-foreground)] mb-1 block"
            >
              Server name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={editServerForm.name}
              onChange={handleEditServerChange}
              className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Write your title"
              required
            />

            <label
              htmlFor="description"
              className="text-sm text-[var(--muted-foreground)] mb-1 block"
            >
              Server description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={editServerForm.description}
              onChange={handleEditServerChange}
              className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Write your description"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal((prev) => ({ ...prev, edit: false }))}
                className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
              >
                Cancel
              </button>

              <button
                onClick={handleEditServer}
                disabled={
                  editServerForm.name.trim() === "" ||
                  editServerForm.description.trim() === ""
                }
                className={`bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 ${
                  editServerForm.name.trim() === "" &&
                  editServerForm.description.trim() === "" &&
                  "cursor-not-allowed"
                }`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.delete && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({ ...prev, delete: false }));
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, delete: false }))}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="relative w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5 z-50">
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
                  setModal((prev) => ({
                    ...prev,
                    delete: false,
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

      {modal.leave && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({ ...prev, leave: false }));
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, leave: false }))}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="relative w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5 z-50">
            <h1 className="text-base font-semibold mb-1">
              Leave {server.name}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Are you sure you want to leave {server.name}? You {"won't"} be
              able to rejoin this server unless you are re-invited.
            </p>
            <div className="flex flex-row justify-end gap-2">
              <button
                onClick={() => setModal((prev) => ({ ...prev, leave: false }))}
                className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveServer}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.category && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setModal((prev) => ({ ...prev, category: false }));
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            onClick={() => setModal((prev) => ({ ...prev, category: false }))}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="relative w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5 z-50">
            <h1 className="text-base font-semibold mb-1">Create Category</h1>

            <input
              id="name"
              name="name"
              value={createCategoryForm.name}
              onChange={handleCreateCategoryChange}
              className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />

            <div className="flex flex-row justify-end gap-2">
              <button
                onClick={() =>
                  setModal((prev) => ({ ...prev, category: false }))
                }
                className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
