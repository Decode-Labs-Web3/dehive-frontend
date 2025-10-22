"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { serverTag } from "@/constants/index.constants";
import { toastSuccess, toastError } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  faPlus,
  faX,
  faGamepad,
  faUserGroup,
  faBookOpen,
  faSchool,
  faPeopleGroup,
  faPalette,
  faChevronRight,
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
  const [inviteLink, setInviteLink] = useState("");

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

  const handleInvite = async () => {
    const raw = inviteLink.trim();
    if (raw === "") return;
    const code = raw.match(/code=([^&\s]+)/)?.[1] || raw;
    try {
      const apiResponse = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        router.push("/");
        return;
      }
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        setModalOpen(false);
        setTab({ ...allFalse, tag: true });
        setInviteLink("");
        handleGetServer();
        const serverId = String(response.data.server_id);
        router.push(`/app/channels/${serverId}`);
      }
    } catch (error) {
      console.error(error);
      console.log("Server for Invite to server error");
      return;
    }
  };

  return (
    <>
      <div className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition">
        <Tooltip>
          <TooltipTrigger asChild>
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
              className="w-full h-full flex items-center justify-center rounded-md hover:bg-blue-400"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            className="bg-black text-white h-10 text-center font-semibold text-xl"
          >
            Add Server
          </TooltipContent>
          {/* <div className="hidden group-hover:block pointer-events-none z-10 absolute ml-2 font-medium top-1/2 -translate-y-1/2 px-2 py-1 left-full rounded bg-black/90 text-white whitespace-nowrap text-xs shadow">
          Add Server
        </div> */}
        </Tooltip>
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
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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

          <div className="relative z-40 w-full max-w-xl rounded-2xl bg-[#2b2d31] text-neutral-100 border border-white/10 shadow-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                {tab.invite ? (
                  <h1 className="text-2xl font-bold">Join a Server</h1>
                ) : (
                  <h1 className="text-2xl font-bold">Create Your Server</h1>
                )}
                {!tab.invite && (
                  <p className="mt-2 text-neutral-300 leading-relaxed">
                    Your server is where you and your friends hang out. Make
                    yours and start talking.
                  </p>
                )}
              </div>
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>

            {tab.info && (
              <>
                <p className="text-sm text-neutral-400 mb-4">
                  Set up your server name and description.
                </p>

                <label
                  htmlFor="name"
                  className="text-xs uppercase tracking-wide text-neutral-400 mb-1 block"
                >
                  Server name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={serverForm.name}
                  onChange={handleChange}
                  className="w-full border border-white/10 bg-neutral-800 text-neutral-100 placeholder-neutral-400 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g. Gaming with friends"
                  required
                />

                <label
                  htmlFor="description"
                  className="text-xs uppercase tracking-wide text-neutral-400 mb-1 block"
                >
                  Server description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={serverForm.description}
                  onChange={handleChange}
                  className="w-full border border-white/10 bg-neutral-800 text-neutral-100 placeholder-neutral-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="What’s this server about?"
                  required
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="border border-white/10 text-neutral-200 rounded px-3 py-2 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateServer}
                    disabled={
                      serverForm.name.trim() === "" ||
                      serverForm.description.trim() === ""
                    }
                    className={`bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-500 disabled:opacity-50 ${
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
                <div className="mt-3 mb-2">
                  <p className="text-xs font-semibold text-neutral-400">
                    START FROM A TEMPLATE
                  </p>
                </div>
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {serverTag.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setServerForm((prev) => ({
                          ...prev,
                          tags: [tag],
                        }));
                        setTab({ ...allFalse, info: true });
                      }}
                      className="w-full flex items-center justify-between gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-4 transition"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-emerald-400">
                          <FontAwesomeIcon icon={tagIcon[tag]} />
                        </span>
                        <span className="text-base text-neutral-100">
                          {tag}
                        </span>
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-neutral-400"
                      />
                    </button>
                  ))}
                </div>

                <div className="my-5 text-center">
                  <p className="text-lg font-semibold text-neutral-100">
                    Have an invite already?
                  </p>
                </div>
                <button
                  onClick={() => {
                    setInviteLink("");
                    setTab({ ...allFalse, invite: true });
                  }}
                  className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-neutral-100"
                >
                  Join a Server
                </button>
              </>
            )}

            {tab.invite && (
              <>
                <h2 className="text-base font-semibold mb-1">Invite</h2>
                <p className="text-sm text-neutral-400 mb-3">
                  Join a server with an invite link.
                </p>
                <input
                  type="text"
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  placeholder="Enter invite link"
                  className="w-full border border-white/10 bg-neutral-800 text-neutral-100 placeholder-neutral-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setTab({ ...allFalse, tag: true })}
                    className="border border-white/10 text-neutral-200 rounded px-3 py-2 hover:bg-white/10"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleInvite}
                    className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-500"
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
