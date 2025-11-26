"use client";

import { createPortal } from "react-dom";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Wallet from "@/components/common/Wallet";
import { Switch } from "@/components/ui/switch";
import { getApiHeaders } from "@/utils/api.utils";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useSoundContext } from "@/contexts/SoundContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarComponent from "@/components/common/AvatarComponent";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CameraCaptureDialog } from "@/components/common/CameraCaptureDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  faRightFromBracket,
  faX,
  faCamera,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface UserPanelProps {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  setUserPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserPanel({
  theme,
  setTheme,
  setUserPanel,
}: UserPanelProps) {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const { user, updateUserDetail } = useUser();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { sound, setSound } = useSoundContext();

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

  const [userPanelSetting, setUserPanelSetting] = useState<string>("account");
  const [loadingAvatar, setLoadingAvartar] = useState({
    loading: false,
    new: false,
  });
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);

  const [updateUserInfo, setUpdateUserInfo] = useState({
    avatar_ipfs_hash: user.avatar_ipfs_hash,
    display_name: user.display_name,
    bio: user.bio,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleLogout = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const uploadAvatarFile = async (file: File) => {
    setLoadingAvartar((prev) => ({ ...prev, loading: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiResponse = await fetch("/api/user/avartar", {
        method: "POST",
        headers: { "X-Frontend-Internal-Request": "true" },
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
      console.log("avatar ipfs hash:", response.ipfsHash);
    } catch (error) {
      console.error("Avatar upload request error:", error);
    } finally {
      setLoadingAvartar({ new: true, loading: false });
    }
  };

  const handleAvartarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    try {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        console.error("Invalid file type");
        return;
      }
      await uploadAvatarFile(file);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/user/profile-change", {
        method: "PUT",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          current: updateUserInfo,
          original: {
            avatar_ipfs_hash: user.avatar_ipfs_hash,
            display_name: user.display_name,
            bio: user.bio,
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
        updateUserDetail(
          updateUserInfo.avatar_ipfs_hash,
          updateUserInfo.display_name,
          updateUserInfo.bio
        );
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
    } finally {
      setLoading(false);
    }
  };

  const isProfileChange =
    updateUserInfo.display_name !== user.display_name ||
    updateUserInfo.bio !== user.bio ||
    updateUserInfo.avatar_ipfs_hash !== user.avatar_ipfs_hash;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="relative z-[101] flex h-full w-full border border-border bg-background text-foreground">
        <Tabs
          value={userPanelSetting}
          onValueChange={setUserPanelSetting}
          orientation="vertical"
          className="flex h-full w-full"
        >
          <aside className="flex h-full w-64 flex-col border-r border-border">
            <div className="px-6 pb-4 pt-6 shrink-0 border-b border-border bg-background">
              <div className="mt-2 flex items-center gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-foreground">
                    User Panel Settings
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4">
              <TabsList
                className="flex flex-col w-full bg-transparent gap-0 p-0"
                vertical
              >
                <TabsTrigger
                  value="account"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  My Account
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Profiles
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  vertical
                  className="w-full justify-start text-left px-3 py-3 rounded-none border-b border-border/50"
                >
                  Theme
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-2 shrink-0 px-3 pb-4">
              <div className="mb-4 h-px w-full bg-border" />
              <Button
                variant="destructive"
                className="w-full flex items-center justify-between px-3"
                onClick={handleLogout}
                disabled={loading}
              >
                <span>Logout</span>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </Button>
            </div>
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
                size="sm"
                onClick={() => setUserPanel(false)}
                variant="ghost"
                className="flex h-auto flex-col items-center gap-1
                  rounded-xl px-3 py-2
                  text-[10px] uppercase
                  bg-transparent text-foreground
                  hover:bg-accent
                "
              >
                <span className="rounded-full border border-border p-2">
                  <FontAwesomeIcon icon={faX} />
                </span>
                Esc
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 pb-32">
              <TabsContent value="account">
                <div className="max-w-2xl space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-5">
                    My Account
                  </h2>

                  <Card className="bg-secondary rounded-lg">
                    <CardHeader className="flex items-center gap-4 p-4">
                      <div className="relative">
                        <AvatarComponent
                          avatar_ipfs_hash={user.avatar_ipfs_hash}
                          displayname={user.display_name}
                          status="online"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {user.display_name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          @{user.username}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setUserPanelSetting("profile")}
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
                        Wallet
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex justify-center">
                      <Wallet />
                    </CardContent>
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
                            {user.display_name}
                          </p>
                        </div>
                        <Button
                          onClick={() => setUserPanelSetting("profile")}
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
                            {user.bio || "No bio yet"}
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
                            {user.server_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Role
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {user.dehive_role}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Following
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {user.following_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Followers
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {user.followers_number}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <div className="max-w-2xl space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-5">
                    My Profile
                  </h2>

                  <div className="bg-secondary rounded-lg p-4 mb-4">
                    <Label className="block text-xs uppercase text-muted-foreground mb-3">
                      Avatar
                    </Label>
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 rounded-xl border-2 border-border overflow-hidden relative flex items-center justify-center">
                        {loadingAvatar.loading ? (
                          <Skeleton className="w-32 h-32 rounded-xl" />
                        ) : (
                          <AvatarComponent
                            avatar_ipfs_hash={updateUserInfo.avatar_ipfs_hash}
                            displayname={user.display_name}
                            status="online"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          onClick={openFilePicker}
                          disabled={loading || loadingAvatar.loading}
                          className="justify-start"
                        >
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          Upload image
                        </Button>
                        <Button
                          onClick={() => setCameraDialogOpen(true)}
                          disabled={loading || loadingAvatar.loading}
                          className="justify-start"
                        >
                          <FontAwesomeIcon icon={faCamera} className="mr-2" />
                          Take a photo
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvartarUpload}
                        />
                      </div>
                    </div>
                  </div>

                  <CameraCaptureDialog
                    open={cameraDialogOpen}
                    onOpenChange={setCameraDialogOpen}
                    onUpload={async (file) => {
                      await uploadAvatarFile(file);
                    }}
                    loading={loading || loadingAvatar.loading}
                  />

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
              </TabsContent>

              <TabsContent value="theme">
                <div className="max-w-2xl space-y-5">
                  <h2 className="text-xl font-semibold text-foreground m-4">
                    Theme
                  </h2>
                  <ToggleGroup
                    type="single"
                    value={theme}
                    onValueChange={handleTheme}
                  >
                    <ToggleGroupItem value="light" className="bg-white m-2">
                      Light
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="dark"
                      className="bg-black m-2 text-white"
                    >
                      Dark
                    </ToggleGroupItem>
                    <ToggleGroupItem value="alt" className="bg-violet-500 m-2">
                      Alt
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sound"
                      checked={sound}
                      onCheckedChange={setSound}
                    />
                    <Label htmlFor="sound">
                      {sound ? "Sound ON" : "Sound OFF"}
                    </Label>
                  </div>
                </div>
              </TabsContent>
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
                          avatar_ipfs_hash: user.avatar_ipfs_hash,
                          display_name: user.display_name,
                          bio: user.bio,
                        });
                      }}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      variant="default"
                      size="sm"
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </Tabs>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
