"use client";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faX } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
// Dialog removed from this component to avoid nested portal/portal recursion

interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_active: boolean;
}
interface UserPannelProps {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  userData: UserDataProps;
  handleUserData: () => void;
  setUserPannel: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserPannel({
  theme,
  userData,
  setTheme,
  setUserPannel,
  handleUserData,
}: UserPannelProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const handleTheme = (theme: string) => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      setTheme("dark");
      document.documentElement.classList.remove("alt");
      document.documentElement.classList.add("dark");
    } else if (theme === "alt") {
      setTheme("alt");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("alt");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark", "alt");
    }
  };

  const allFalse = { account: false, profile: false, theme: false };
  const [userPannelSetting, setUserPannelSetting] = useState<
    Record<string, boolean>
  >({ ...allFalse, account: true });
  const [loadingAvatar, setLoadingAvartar] = useState({
    loading: false,
    new: false,
  });

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avatar_ipfs_hash: userData?.avatar_ipfs_hash,
    display_name: userData?.display_name,
    bio: userData?.bio,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvartarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoadingAvartar((prev) => ({
      ...prev,
      loading: true,
    }));
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type");
      event.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiResponse = await fetch("/api/user/avartar", {
        method: "POST",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        body: formData,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      if (!apiResponse.ok) {
        console.error("Avatar upload failed:", apiResponse);
        return;
      }

      const response = await apiResponse.json();

      setUpdateUserInfo((prev) => ({
        ...prev,
        avatar_ipfs_hash: response.ipfsHash,
      }));
    } catch (error) {
      console.error("Avatar upload request error:", error);
      return;
    } finally {
      setLoadingAvartar({
        new: true,
        loading: false,
      });
    }
  };

  const handleUserInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUpdateUserInfo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const apiResponse = await fetch("/api/user/profile-change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          current: updateUserInfo,
          original: {
            avatar_ipfs_hash: userData?.avatar_ipfs_hash,
            display_name: userData?.display_name,
            bio: userData?.bio,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      if (!apiResponse.ok) {
        console.error("Profile update failed:", apiResponse);
        return;
      }
      const response = await apiResponse.json();

      if (
        response.statusCode === 200 &&
        response.message === "Profile updated"
      ) {
        handleUserData();
        setTimeout(() => {
          setUpdateUserInfo({
            avatar_ipfs_hash: userData?.avatar_ipfs_hash,
            display_name: userData?.display_name,
            bio: userData?.bio,
          });
        }, 1000);
      }

      if (
        response.statusCode === 207 &&
        response.message === "Partial update"
      ) {
        console.error(response.message || "Partial failed");
      }
    } catch (error) {
      console.error("Profile update request error:", error);
      return;
    }
  };

  const isProfileChange =
    updateUserInfo.display_name !== userData.display_name ||
    updateUserInfo.bio !== userData.bio ||
    updateUserInfo.avatar_ipfs_hash !== userData.avatar_ipfs_hash;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <aside className="flex w-64 flex-col border-r border-border bg-secondary">
          <div className="px-6 pb-5 pt-7">
            <div className="mt-4 flex items-center gap-3">
              <div className="min-w-0">
                <h1> User Pannel Settings </h1>
              </div>
            </div>
          </div>

          <nav className="mt-2 flex-1 flex flex-col gap-2 justify-start items-start space-y-1 px-3">
            <Button
              variant="ghost"
              className="w-full text-left"
              onClick={() =>
                setUserPannelSetting({ ...allFalse, account: true })
              }
            >
              My Account
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left"
              onClick={() =>
                setUserPannelSetting({ ...allFalse, profile: true })
              }
            >
              Profiles
            </Button>

            <Button
              variant="ghost"
              className="w-full text-left"
              onClick={() => setUserPannelSetting({ ...allFalse, theme: true })}
            >
              Theme
            </Button>

            <div className="my-4 w-full border border-foreground" />

            <Button
              variant="destructive"
              className="w-full flex items-center justify-between"
              onClick={handleLogout}
            >
              <span>Logout</span>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </Button>
          </nav>
        </aside>

        <section className="relative flex flex-1 flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border px-10 py-7">
            <div>
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-foreground">
                  User Panel
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account and profile settings.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setUserPannel(false)}
              variant="ghost"
              className="flex flex-col items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              <span className="rounded-full border border-border p-2">
                <FontAwesomeIcon icon={faX} />
              </span>
              Esc
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-10 py-8">
            {userPannelSetting.account && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-xl font-semibold text-foreground mb-5">
                  My Account
                </h2>

                <Card className="bg-secondary rounded-lg">
                  <CardHeader className="flex items-center gap-4 p-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage
                          src={`https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`}
                        />
                        <AvatarFallback>
                          {userData?.display_name} Avatar
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-[hsl(var(--success))] rounded-full border-4 border-secondary"></div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {userData.display_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        @{userData.username}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        setUserPannelSetting({ ...allFalse, profile: true })
                      }
                      size="sm"
                      className="px-3"
                    >
                      Edit User Profile
                    </Button>
                  </CardHeader>
                </Card>

                <Card className="bg-secondary rounded-lg">
                  <CardHeader className="p-4">
                    <CardTitle className="text-xs uppercase text-muted-foreground">
                      Display Name
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {userData.display_name}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          setUserPannelSetting({ ...allFalse, profile: true })
                        }
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary rounded-lg">
                  <CardHeader className="p-4">
                    <CardTitle className="text-xs uppercase text-muted-foreground">
                      Bio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {userData.bio || "No bio yet"}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary rounded-lg">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                      Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Servers
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {userData.server_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Role
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {userData.dehive_role}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Following
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {userData.following_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Followers
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {userData.followers_number}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {userPannelSetting.profile && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-xl font-semibold text-foreground mb-5">
                  My Profile
                </h2>

                <div className="bg-secondary rounded-lg p-4 mb-4">
                  <Label className="block text-xs uppercase text-muted-foreground mb-3">
                    Avatar
                  </Label>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openFilePicker}
                    className="w-32 h-32 rounded-xl border-2 border-border overflow-hidden relative cursor-pointer group flex items-center justify-center"
                    aria-label="Change avatar"
                    title="Click to change avatar"
                  >
                    {loadingAvatar.loading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarImage
                          src={`https://ipfs.de-id.xyz/ipfs/${updateUserInfo.avatar_ipfs_hash}`}
                        />
                        <AvatarFallback>
                          {userData?.display_name} Avatar
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors grid place-items-center text-white text-sm font-medium">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        Click to upload
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvartarUpload}
                    />
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-4 mb-4">
                  <Label
                    htmlFor="display_name"
                    className="block text-xs uppercase text-muted-foreground mb-2"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    value={updateUserInfo.display_name}
                    onChange={handleUserInfoChange}
                    placeholder="Enter display name"
                  />
                </div>

                <div className="bg-secondary rounded-lg p-4 mb-4">
                  <Label
                    htmlFor="bio"
                    className="block text-xs uppercase text-muted-foreground mb-2"
                  >
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={updateUserInfo.bio}
                    onChange={handleUserInfoChange}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {userPannelSetting.theme && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-xl font-semibold text-foreground m-4">
                  Theme
                </h2>
                <Button
                  className={`bg-white m-2 ${
                    theme === "light" ? "ring-4 ring-blue-500" : ""
                  }`}
                  onClick={() => handleTheme("light")}
                >
                  Light
                </Button>
                <Button
                  className={`bg-black m-2 text-white ${
                    theme === "dark" ? "ring-4 ring-blue-500" : ""
                  }`}
                  onClick={() => handleTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  className={`bg-violet-500 m-2 ${
                    theme === "alt" ? "ring-4 ring-blue-500" : ""
                  }`}
                  onClick={() => handleTheme("alt")}
                >
                  Alt
                </Button>
              </div>
            )}
          </div>

          {isProfileChange && (
            <div className="pointer-events-auto absolute inset-x-8 bottom-6 rounded-2xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 px-6 py-4 text-sm text-foreground">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Careful — you have unsaved changes!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Save or reset your edits before closing this panel.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Button
                    onClick={() => {
                      setUpdateUserInfo({
                        avatar_ipfs_hash: userData?.avatar_ipfs_hash,
                        display_name: userData?.display_name,
                        bio: userData?.bio,
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    variant="default"
                    size="sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
