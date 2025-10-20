"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { serverTag } from "@/constants/index.constants";
import { toastSuccess, toastError } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faX,
  faGamepad,
  faUserGroup,
  faBookOpen,
  faSchool,
  faPeopleGroup,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";
interface Props {
  handleGetServer: () => void;
}

interface ServerForm {
  tags: string[];
  name: string;
  description: string;
}

const tagIcon: Record<string, IconDefinition> = {
  Gaming: faGamepad,
  Friends: faUserGroup,
  "Study Group": faBookOpen,
  "School Club": faSchool,
  "Local Community": faPeopleGroup,
  "Artist & Creators": faPalette,
};

export default function AddServer({ handleGetServer }: Props) {
  const router = useRouter();
  const allFalse = { tag: false, info: false, invite: false };
  const [tab, setTab] = useState({ ...allFalse, tag: true });
  const [modalOpen, setModalOpen] = useState(false);

  const [serverForm, setServerForm] = useState<ServerForm>({
    tags: [],
    name: "",
    description: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateServer = async () => {
    if (serverForm.name === "" || serverForm.description === "") {
      toastError("Please fill in all fields");
      return;
    }
    console.log(serverForm);
    try {
      const apiResponse = await fetch("/api/servers/server/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(serverForm),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.log(apiResponse);
        toastError("Cann't Create Server");
        return;
      }
      const response = await apiResponse.json();
      // console.log(response);
      setTab({ ...allFalse, tag: true });
      setServerForm({
        tags: [],
        name: "",
        description: "",
      });
      handleGetServer();
      router.push(`/app/channels/${response.data._id}`);
      toastSuccess(response.message);
    } catch (error) {
      console.error(error);
      toastError("Server Create Error");
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition">
        <button
          onClick={() => {
            setTab({ ...allFalse, tag: true });
            setModalOpen(true);
            setServerForm({
              tags: [],
              name: "",
              description: "",
            });
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <div className="pointer-events-none z-10 absolute ml-2 font-semibold top-1/2 -translate-y-1/2 px-2 py-1 left-full rounded-md bg-black text-[var(--accent-foreground)] opacity-0 group-hover:opacity-100 whitespace-nowrap shadow">
          Add Server
        </div>
      </div>
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setTab({ ...allFalse, tag: true });
              setModalOpen(false);
              setServerForm({
                tags: [],
                name: "",
                description: "",
              });
            }
          }}
          className="fixed inset-0 z-20 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => {
              setTab({ ...allFalse, tag: true });
              setModalOpen(false);
              setServerForm({
                tags: [],
                name: "",
                description: "",
              });
            }}
          />

          <div className="relative z-40 w-full max-w-md rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)] shadow-xl p-5">
            <div className="flex flex-row justify-between">
              {tab.invite ? (
                <h1 className="text-base font-semibold mb-1">Join a server</h1>
              ) : (
                <h1 className="text-base font-semibold mb-1">
                  Create your server
                </h1>
              )}
              <button
                onClick={() => {
                  setTab({ ...allFalse, tag: true });
                  setModalOpen(false);
                  setServerForm({
                    tags: [],
                    name: "",
                    description: "",
                  });
                }}
              >
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>

            {tab.info && (
              <>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Set up your server name and description.
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
                  value={serverForm.name}
                  onChange={handleChange}
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
                  value={serverForm.description}
                  onChange={handleChange}
                  className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  placeholder="Write your description"
                  required
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateServer}
                    disabled={
                      serverForm.name.trim() === "" ||
                      serverForm.description.trim() === ""
                    }
                    className={`bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 ${
                      serverForm.name.trim() === "" &&
                      serverForm.description.trim() === "" &&
                      "cursor-not-allowed"
                    }`}
                  >
                    Create
                  </button>
                </div>
              </>
            )}

            {tab.tag && (
              <>
                <h1>Server Tag</h1>
                {serverTag.map((tag, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        setServerForm((prev) => ({
                          ...prev,
                          tags: [tag],
                        }));
                        setTab({ ...allFalse, info: true });
                      }}
                      className="flex gap-2"
                    >
                      <FontAwesomeIcon icon={tagIcon[tag]} />
                      {tag}
                    </button>
                  </div>
                ))}

                <h1>Have an invite already?</h1>

                <button
                  onClick={() => {
                    setTab({ ...allFalse, invite: true });
                  }}
                >
                  Join a Server
                </button>
              </>
            )}

            {tab.invite && (
              <>
                <h1>Invite</h1>
                <p>Join a server with an invite link.</p>
                <input
                  type="text"
                  placeholder="Enter invite link"
                  className="w-full border border-[var(--border-color)] bg-[var(--background-secondary)] text-[var(--foreground)] rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setTab({ ...allFalse, tag: true })}
                    className="border border-[var(--border-color)] text-[var(--foreground)] rounded px-3 py-2 hover:bg-[var(--background-secondary)]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {}}
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded px-4 py-2 hover:opacity-90"
                  >
                    Join Server
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
