"use client";

import Link from "next/link";
import Image from "next/image";
import ServerBarItems from "./index";
import { getCookie } from "@/utils/cookie.utils";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServerRefresh } from "@/contexts/ServerRefreshContext.contexts";
import { faCopy, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

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

interface ServerMembersProps {
  server: ServerProps;
  fetchServerInfo: () => void;
  setServerPannel: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MembershipsProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  role: string;
  is_muted: boolean;
  joined_at: string;
}

export default function ServerMembers({
  server,
  fetchServerInfo,
  setServerPannel,
}: ServerMembersProps) {
  const { refreshServers } = useServerRefresh();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [kickForm, setKickForm] = useState({
    server_id: server._id,
    target_user_dehive_id: "",
    reason: "",
  });
  const [banForm, setBanForm] = useState({
    server_id: server._id,
    target_user_dehive_id: "",
    reason: "Suspicious or spam account",
  });
  const [kickModal, setKickModal] = useState<Record<string, boolean>>({});
  const [banModal, setBanModal] = useState<Record<string, boolean>>({});
  const [ownershipModal, setOwnershipModal] = useState<Record<string, boolean>>(
    {}
  );
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});
  const [memberships, setMemberships] = useState<MembershipsProps[]>([]);
  const [userSettingModal, setUserSettingModal] = useState<
    Record<string, boolean>
  >({});
  const [ownershipAgree, setOwnershipAgree] = useState(false);
  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);
  const fetchServerMember = useCallback(async () => {
    setLoading(true);
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
        setMemberships(response.data);
        setUserSettingModal(
          Object.fromEntries(
            response.data.map((membership: MembershipsProps) => [
              membership._id,
              false,
            ])
          )
        );
        setKickModal(
          Object.fromEntries(
            response.data.map((membership: MembershipsProps) => [
              membership._id,
              false,
            ])
          )
        );
        setBanModal(
          Object.fromEntries(
            response.data.map((membership: MembershipsProps) => [
              membership._id,
              false,
            ])
          )
        );
        setOwnershipModal(
          Object.fromEntries(
            response.data.map((membership: MembershipsProps) => [
              membership._id,
              false,
            ])
          )
        );
        setUserProfileModal(
          Object.fromEntries(
            response.data.map((membership: MembershipsProps) => [
              membership._id,
              false,
            ])
          )
        );
      }
    } catch (error) {
      console.error(error);
      console.log("Sever error for fetch server membership");
    } finally {
      setLoading(false);
    }
  }, [server]);

  useEffect(() => {
    fetchServerMember();
  }, [fetchServerMember]);

  const handleKickFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKickForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleKickUser = async () => {
    if (
      kickForm.server_id.trim() === "" ||
      kickForm.target_user_dehive_id.trim() === "" ||
      kickForm.reason.trim() === ""
    )
      return;
    try {
      const apiResponse = await fetch("/api/servers/members/kick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(kickForm),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      if (
        response.statusCode === 201 &&
        response.message === "User successfully kicked."
      ) {
        fetchServerMember();
        setKickForm({
          server_id: server._id,
          target_user_dehive_id: "",
          reason: "",
        });
      }
    } catch (error) {
      console.error(error);
      console.log("Server error kick user");
    }
  };

  const handleBanFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setBanForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleBanUser = async () => {
    if (
      banForm.server_id.trim() === "" ||
      banForm.target_user_dehive_id.trim() === "" ||
      banForm.reason.trim() === ""
    )
      return;
    try {
      const apiResponse = await fetch("/api/servers/members/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(banForm),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      if (
        response.statusCode === 201 &&
        response.message === "User successfully baned."
      ) {
        fetchServerMember();
        setBanForm({
          server_id: server._id,
          target_user_dehive_id: "",
          reason: "Suspicious or spam account",
        });
      }
    } catch (error) {
      console.error(error);
      console.log("Server error ban user");
    }
  };

  const handleTransferOwnership = async (memberId: string) => {
    if (!ownershipAgree) return;
    try {
      const apiResponse = await fetch(
        "/api/servers/members/transfer-ownership",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({
            serverId: server._id,
            memberId,
          }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Ownership transferred successfully."
      ) {
        setOwnershipModal((prev) => ({
          ...prev,
          [memberId]: false,
        }));
        refreshServers?.();
        fetchServerInfo?.();
        setServerPannel(false);
      }
    } catch (error) {
      console.error(error);
      console.log("Server error ban user");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
          Members — {memberships.length}
        </h3>
      </div>

      {memberships.map((membership) => (
        <div key={membership._id}>
          <div className="grid grid-cols-2 items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--surface-hover)]">
            <div className="justify-start grid grid-cols-[1fr_2fr_1fr_1fr]">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={
                    membership
                      ? `https://ipfs.de-id.xyz/ipfs/${membership.avatar}`
                      : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={`${membership.display_name}'s avatar`}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--foreground)] truncate">
                  {membership.display_name}
                </span>

                <span className="text-xs text-[var(--muted-foreground)] truncate">
                  @{membership.username}
                </span>
              </div>

              <span className="text-xs text-[var(--muted-foreground)]">
                Joined
                <br />
                {new Date(membership.joined_at).toLocaleString()}
              </span>

              <div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-foreground)] font-medium">
                  {membership.role.charAt(0).toUpperCase() +
                    membership.role.slice(1)}
                </span>
                {membership.is_muted && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                    MUTED
                  </span>
                )}
                {membership.is_banned && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white font-medium">
                    BANNED
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                setUserSettingModal((prev) => ({
                  ...prev,
                  [membership._id]: true,
                }))
              }
              className="justify-self-end"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>

          {/* user setting modal */}
          {userSettingModal[membership._id] && (
            <div role="dialog">
              <div
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setUserSettingModal((prev) => ({
                      ...prev,
                      [membership._id]: false,
                    }));
                  }
                }}
                onClick={() => {
                  setUserSettingModal((prev) => ({
                    ...prev,
                    [membership._id]: false,
                  }));
                }}
                className="fixed inset-0 bg-transparent z-[150]"
              />

              <div className="absolute right-0 mr-4 mt-2 z-[200]">
                <div className="w-56 bg-[#2f3136] text-sm rounded-md shadow-lg ring-1 ring-black/40 overflow-hidden">
                  <div
                    onClick={() => {
                      setUserProfileModal((prev) => ({
                        ...prev,
                        [membership._id]: true,
                      }));
                      setUserSettingModal((prev) => ({
                        ...prev,
                        [membership._id]: false,
                      }));
                    }}
                    className="px-4 py-3 text-white font-semibold"
                  >
                    Profile
                  </div>

                  {/* Moderation actions */}
                  <div className="border-t border-black/20 px-1 py-1">
                    {userId !== membership._id && (
                      <>
                        <Link
                          href={`/app/channels/me/${membership._id}`}
                          className="block w-full text-left px-4 py-3 text-gray-200 hover:bg-[#36373a]"
                        >
                          Message
                        </Link>

                        <button
                          onClick={() => {
                            setUserSettingModal((prev) => ({
                              ...prev,
                              [membership._id]: false,
                            }));
                            setKickModal((prev) => ({
                              ...prev,
                              [membership._id]: true,
                            }));
                            setKickForm((prev) => ({
                              ...prev,
                              target_user_dehive_id: membership._id,
                              reason: "",
                            }));
                          }}
                          className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#3b1f1f] rounded-md"
                        >
                          Kick {membership.username}
                        </button>

                        <button
                          onClick={() => {
                            setUserSettingModal((prev) => ({
                              ...prev,
                              [membership._id]: false,
                            }));
                            setBanModal((prev) => ({
                              ...prev,
                              [membership._id]: true,
                            }));
                            setBanForm((prev) => ({
                              ...prev,
                              target_user_dehive_id: membership._id,
                              reason: "Suspicious or spam account",
                            }));
                          }}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#3b1f1f] rounded-md"
                        >
                          Ban {membership.username}
                        </button>

                        <div className="border-t border-black/10 my-1" />

                        <button
                          onClick={() => {
                            setUserSettingModal((prev) => ({
                              ...prev,
                              [membership._id]: false,
                            }));
                            setOwnershipModal((prev) => ({
                              ...prev,
                              [membership._id]: true,
                            }));
                            setOwnershipAgree(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-[#36373a] rounded-md"
                        >
                          Transfer Ownership
                        </button>
                      </>
                    )}
                  </div>

                  <div className="border-t border-black/20">
                    <button
                      onClick={async (
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {
                        const button = event.currentTarget;
                        const oldText = button.textContent;
                        await navigator.clipboard.writeText(membership._id);

                        button.textContent = "Copied!";
                        setTimeout(() => {
                          button.textContent = oldText;
                        }, 1000);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:bg-[#36373a]"
                    >
                      Copy User ID
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ban modal */}
          {banModal[membership._id] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[250] flex items-center justify-center px-4"
            >
              <div
                onClick={() => {
                  setBanModal((prev) => ({
                    ...prev,
                    [membership._id]: false,
                  }));
                  setBanForm((prev) => ({
                    ...prev,
                    target_user_dehive_id: "",
                    reason: "Suspicious or spam account",
                  }));
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <div className="relative w-full max-w-md bg-[#2f3136] rounded-lg shadow-lg ring-1 ring-black/40 z-[300] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/20">
                  <h2 className="text-lg font-semibold text-white">
                    Ban @{membership.username}?
                  </h2>
                </div>

                <div className="px-6 py-4">
                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                      Reason for Ban
                    </legend>

                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value="Suspicious or spam account"
                        checked={
                          banForm.reason === "Suspicious or spam account"
                        }
                        onChange={handleBanFormChange}
                        className="accent-[var(--accent)]"
                      />
                      <span className="text-sm">
                        Suspicious or spam account
                      </span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value="Compromised or hacked account"
                        checked={
                          banForm.reason === "Compromised or hacked account"
                        }
                        onChange={handleBanFormChange}
                        className="accent-[var(--accent)]"
                      />
                      <span className="text-sm">
                        Compromised or hacked account
                      </span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value="Breaking server rules"
                        checked={banForm.reason === "Breaking server rules"}
                        onChange={handleBanFormChange}
                        className="accent-[var(--accent)]"
                      />
                      <span className="text-sm">Breaking server rules</span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value="Other: "
                        checked={banForm.reason.startsWith("Other")}
                        onChange={handleBanFormChange}
                        className="accent-[var(--accent)] mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-sm">Other</span>

                        {banForm.reason.startsWith("Other") && (
                          <input
                            autoFocus
                            name="reason"
                            placeholder="Type your reason…"
                            value={banForm.reason}
                            onChange={handleBanFormChange}
                            className="mt-2 w-full rounded-md bg-[#202225] border border-black/30 text-sm text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        )}
                      </div>
                    </label>
                  </fieldset>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/5">
                  <button
                    onClick={() => {
                      setBanModal((prev) => ({
                        ...prev,
                        [membership._id]: false,
                      }));
                      setBanForm((prev) => ({
                        ...prev,
                        target_user_dehive_id: "",
                        reason: "",
                      }));
                    }}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#3a3c40] text-white hover:bg-[#4b4d51]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleBanUser}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* kick modal */}
          {kickModal[membership._id] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[250] flex items-center justify-center px-4"
            >
              <div
                onClick={() => {
                  setKickModal((prev) => ({
                    ...prev,
                    [membership._id]: false,
                  }));
                  setKickForm((prev) => ({
                    ...prev,
                    target_user_dehive_id: "",
                    reason: "",
                  }));
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <div className="relative w-full max-w-md bg-[#2f3136] rounded-lg shadow-lg ring-1 ring-black/40 z-[300] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/20">
                  <h2 className="text-lg font-semibold text-white">
                    Kick @{membership.username} from Server
                  </h2>
                  <p className="mt-1 text-sm text-gray-300">
                    Are you sure you want to kick @{membership.username} from
                    the server? They will be able to rejoin again with a new
                    invite.
                  </p>
                </div>

                <div className="px-6 py-4">
                  <label
                    htmlFor={`reason-${membership._id}`}
                    className="block text-xs font-medium text-gray-300 mb-2"
                  >
                    Reason for Kick
                  </label>
                  <input
                    id={`reason-${membership._id}`}
                    name="reason"
                    value={kickForm.reason}
                    onChange={handleKickFormChange}
                    autoFocus
                    placeholder="Add a reason (required)"
                    className="w-full rounded-md bg-[#202225] border border-black/30 text-sm text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/5">
                  <button
                    onClick={() => {
                      setKickModal((prev) => ({
                        ...prev,
                        [membership._id]: false,
                      }));
                      setKickForm((prev) => ({
                        ...prev,
                        target_user_dehive_id: "",
                        reason: "",
                      }));
                    }}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#3a3c40] text-white hover:bg-[#4b4d51]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleKickUser}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Kick
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ownership modal */}
          {ownershipModal[membership._id] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[250] flex items-center justify-center px-4"
            >
              <div
                onClick={() => {
                  setOwnershipModal((prev) => ({
                    ...prev,
                    [membership._id]: false,
                  }));
                  setOwnershipAgree(false);
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <div className="relative w-full max-w-md bg-[#2f3136] rounded-lg shadow-lg ring-1 ring-black/40 z-[300] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/20">
                  <h2 className="text-lg font-semibold text-white">
                    Transfer Ownership
                  </h2>
                  <p className="mt-1 text-sm text-gray-300">
                    This will transfer ownership of {server.name} server to @
                    {membership.username}. This cannot be undone!
                  </p>
                </div>

                <div className="px-6 py-4">
                  <label
                    htmlFor="agree"
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <input
                      id="agree"
                      type="checkbox"
                      checked={ownershipAgree}
                      onChange={() => setOwnershipAgree((prev) => !prev)}
                      required
                    />
                    <span>
                      I acknowledge that by transferring ownership of this
                      server to @{membership.username}, it officially belongs to
                      them.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/5">
                  <button
                    onClick={() => {
                      setOwnershipModal((prev) => ({
                        ...prev,
                        [membership._id]: false,
                      }));
                      setOwnershipAgree(false);
                    }}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-[#3a3c40] text-white hover:bg-[#4b4d51]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleTransferOwnership(membership._id)}
                    disabled={!ownershipAgree}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium bg-red-600 text-white ${
                      !ownershipAgree && "cursor-not-allowed"
                    }`}
                  >
                    Transfer Ownership
                  </button>
                </div>
              </div>
            </div>
          )}

          {userProfileModal[membership._id] && (
            <ServerBarItems.ServerUserProfile
              userId={membership._id}
              setUserProfileModal={setUserProfileModal}
            />
          )}
        </div>
      ))}
    </div>
  );
}
