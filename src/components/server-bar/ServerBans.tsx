"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { ServerProps } from "@/interfaces/server.interface";
import UserInfoModal from "@/components/common/UserInfoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faCopy, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

interface ServerBansProps {
  server: ServerProps;
}

interface MembersBanProps {
  _id: string;
  server_id: string;
  user_dehive_id: string;
  banned_by: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  is_banned: boolean;
  user_profile: UserProfile;
}

interface UserProfile {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  __v: number;
  wallets: [];
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: [];
}

export default function ServerBans({ server }: ServerBansProps) {
  const [loading, setLoading] = useState(false);
  const [banSettingModal, setBanSettingModal] = useState<
    Record<string, boolean>
  >({});
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});
  const [unbanModal, setUnbanModal] = useState<Record<string, boolean>>({});
  const [unbanForm, setUnbanForm] = useState({
    server_id: server._id,
    target_user_dehive_id: "",
    reason: "",
  });
  const [membersBans, setMembersBans] = useState<MembersBanProps[]>([]);
  // console.log("wqdqwdvjqwdvqwhjdvqwudjqvwduqwvd", membersBans);
  const fetchBanList = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/members/ban-list", {
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
        console.log(response.data);
        setMembersBans(response.data.banned_users);
        setBanSettingModal(
          Object.fromEntries(
            response.data.banned_users.map((user: MembersBanProps) => [
              user.user_dehive_id,
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
    fetchBanList();
  }, [fetchBanList]);

  const handleUnbanFormChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setUnbanForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUnbanUser = async () => {
    if (
      unbanForm.server_id.trim() === "" ||
      unbanForm.target_user_dehive_id.trim() === "" ||
      unbanForm.reason.trim() === ""
    )
      return;
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/members/unban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(unbanForm),
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
        response.message === "User successfully unbanned."
      ) {
        fetchBanList();
        setUnbanForm({
          server_id: server._id,
          target_user_dehive_id: "",
          reason: "",
        });
      }
    } catch (error) {
      console.error(error);
      console.log("Server error unban user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="relative grid grid-cols-5 items-center gap-4 rounded-xl border border-border bg-background px-4 py-4 shadow-sm"
          >
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {membersBans.length === 0 && (
        <h1 className="rounded-lg border border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
          No member ban in this server.
        </h1>
      )}
      {membersBans.map((member) => (
        <div
          key={member.user_dehive_id}
          className="relative grid grid-cols-5 items-center gap-4 rounded-xl border border-border bg-background px-4 py-4 shadow-sm"
        >
          <Avatar>
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${member.user_profile.avatar_ipfs_hash}`}
              alt={`${member.user_profile.display_name} avatar`}
            />
            <AvatarFallback>
              {member.user_profile.display_name} Avatar
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-sm font-semibold text-foreground">
              {member.user_profile.display_name}
            </h1>
            <h1 className="text-xs text-muted-foreground">
              @{member.user_profile.username}
            </h1>
          </div>
          <h1 className="text-sm text-muted-foreground">{member.reason}</h1>
          <h1 className="text-xs text-muted-foreground">
            {new Date(member.createdAt).toLocaleString()}
          </h1>
          <button
            type="button"
            onClick={() => {
              setBanSettingModal((prev) => ({
                ...prev,
                [member.user_dehive_id]: true,
              }));
            }}
            className="relative flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          {banSettingModal[member.user_dehive_id] && (
            <div role="dialog">
              <div
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onClick={() => {
                  setBanSettingModal((prev) => ({
                    ...prev,
                    [member.user_dehive_id]: false,
                  }));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setBanSettingModal((prev) => ({
                      ...prev,
                      [member.user_dehive_id]: false,
                    }));
                  }
                }}
                className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
              />

              <div className="absolute right-0 top-full z-[200] mt-3 flex w-48 flex-col gap-1 rounded-lg border border-border bg-background p-2 text-sm text-foreground shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [member.user_dehive_id]: true,
                    }));
                  }}
                  className="rounded-md px-3 py-2 text-left transition hover:bg-accent"
                >
                  Profile
                </button>
                <Link
                  href={`/app/channels/me/${member.user_dehive_id}`}
                  className="rounded-md px-3 py-2 transition hover:bg-accent"
                >
                  Message
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setBanSettingModal((prev) => ({
                      ...prev,
                      [member.user_dehive_id]: false,
                    }));
                    setUnbanModal((prev) => ({
                      ...prev,
                      [member.user_dehive_id]: true,
                    }));
                    setUnbanForm((prev) => ({
                      ...prev,
                      target_user_dehive_id: member.user_dehive_id,
                      reason: "",
                    }));
                  }}
                  className="rounded-md px-3 py-2 text-left transition hover:bg-accent"
                >
                  Unban
                </button>
                <button
                  type="button"
                  onClick={async (
                    event: React.MouseEvent<HTMLButtonElement>
                  ) => {
                    const button = event.currentTarget;
                    const oldText = button.textContent;

                    await navigator.clipboard.writeText(member.user_dehive_id);

                    button.textContent = "Copied!";
                    setTimeout(() => {
                      button.textContent = oldText;
                    }, 1000);
                  }}
                  className="flex flex-row items-center justify-between rounded-md px-3 py-2 transition hover:bg-accent"
                >
                  Copy User ID
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>
          )}

          {unbanModal[member.user_dehive_id] && (
            <div
              role="dialog"
              className="fixed inset-0 z-[300] flex items-center justify-center"
            >
              <div
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setUnbanModal((prev) => ({
                      ...prev,
                      [member.user_dehive_id]: false,
                    }));
                    setUnbanForm((prev) => ({
                      ...prev,
                      target_user_dehive_id: "",
                      reason: "",
                    }));
                  }
                }}
                onClick={() => {
                  setUnbanModal((prev) => ({
                    ...prev,
                    [member.user_dehive_id]: false,
                  }));
                  setUnbanForm((prev) => ({
                    ...prev,
                    target_user_dehive_id: "",
                    reason: "",
                  }));
                }}
                className="fixed inset-0 z-[250] bg-black/80 "
              />

              <div className="relative z-[301] w-full max-w-md rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
                <h1 className="text-lg font-semibold text-foreground">
                  Unban @{member.user_profile.username}
                </h1>
                <label
                  htmlFor="reason"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Unban Reason
                </label>
                <input
                  id="reason"
                  name="reason"
                  type="text"
                  value={unbanForm.reason}
                  onChange={handleUnbanFormChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="mt-4 flex flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUnbanModal((prev) => ({
                        ...prev,
                        [member.user_dehive_id]: false,
                      }));
                      setUnbanForm((prev) => ({
                        ...prev,
                        target_user_dehive_id: "",
                        reason: "",
                      }));
                    }}
                    className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={unbanForm.reason.trim() === "" || loading}
                    onClick={handleUnbanUser}
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Unban
                  </button>
                </div>
              </div>
            </div>
          )}

          {userProfileModal[member.user_dehive_id] && (
            <UserInfoModal
              userId={member.user_dehive_id}
              setUserProfileModal={setUserProfileModal}
            />
          )}
        </div>
      ))}
    </>
  );
}
