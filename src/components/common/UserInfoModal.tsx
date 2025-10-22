"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDataProps {
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
  mutual_followers_list: MutualFollowers[];
  is_active: boolean;
  wallets: Wallets[];
  __v: number;
  mutual_servers_count: number;
  mutual_servers: MutualServers[];
}

interface MutualServers {
  server_id: string;
  server_name: string;
}

interface MutualFollowers {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

interface Wallets {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserInfoModalProps {
  userId: string;
  setUserProfileModal: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function UserInfoModal({
  userId,
  setUserProfileModal,
}: UserInfoModalProps) {
  const router = useRouter();
  const [activeUserId, setActiveUserId] = useState(userId);
  const [tab, setTab] = useState<"activity" | "mutual" | "servers">("mutual");
  const [userInfo, setUserInfo] = useState<UserDataProps | null>(null);

  const fetchUserInfo = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/user/user-dehive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ userId: activeUserId }),
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
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user chatting with errror");
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const fetchConversation = useCallback(
    async (otherUserDehiveId: string) => {
      try {
        const apiResponse = await fetch(
          "/api/me/conversation/conversation-create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Frontend-Internal-Request": "true",
            },
            body: JSON.stringify({ otherUserDehiveId }),
            cache: "no-cache",
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!apiResponse.ok) {
          console.error(apiResponse);
          return;
        }

        const response = await apiResponse.json();
        if (response.statusCode === 200 && response.message === "OK") {
          router.push(`/app/channels/me/${response.data._id}`);
        }
      } catch (error) {
        console.error(error);
        console.log("Server create conversation is error");
      }
    },
    [router]
  );

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          setUserProfileModal((prev) => ({
            ...prev,
            [userId]: false,
          }));
        }
      }}
    >
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        {userInfo ? (
          <div className="flex h-full flex-col md:flex-row">
            <Card className="w-full md:w-80 rounded-none border-0 border-r">
              <CardContent className="p-6">
                <div className="flex items-end gap-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={`https://ipfs.de-id.xyz/ipfs/${userInfo?.avatar_ipfs_hash}`}
                      alt={userInfo.display_name}
                    />
                    <AvatarFallback>
                      {userInfo.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="uppercase">
                    {userInfo.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-semibold">
                    {userInfo.display_name}
                  </h2>
                  <p className="text-muted-foreground">@{userInfo.username}</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Followers</span>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-base font-semibold"
                    >
                      {userInfo.followers_number}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Following</span>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-base font-semibold"
                    >
                      {userInfo.following_number}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Mutual Friends
                    </span>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-base font-semibold"
                    >
                      {userInfo.mutual_followers_number}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Servers</span>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-base font-semibold"
                    >
                      {userInfo.server_count}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {userInfo.bio && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      About Me
                    </h3>
                    <p className="text-sm leading-relaxed">{userInfo.bio}</p>
                  </div>
                )}

                <Button
                  variant="default"
                  className="w-full h-10"
                  onClick={() => {
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [userId]: false,
                    }));
                    fetchConversation(userInfo._id);
                  }}
                >
                  Message
                </Button>
              </CardContent>
            </Card>

            <div className="flex-1 p-6">
              <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as typeof tab)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="mutual">Mutual Friends</TabsTrigger>
                  <TabsTrigger value="servers">
                    Servers ({userInfo?.mutual_servers_count ?? 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-center">
                        No recent activity.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="mutual" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      {userInfo.mutual_followers_list.length === 0 ? (
                        <p className="text-muted-foreground text-center">
                          No mutual friends yet.
                        </p>
                      ) : (
                        <ScrollArea className="h-[48vh] pr-2">
                          <div className="space-y-4">
                            {userInfo.mutual_followers_list.map(
                              (mutual: MutualFollowers) => (
                                <Card
                                  key={mutual.user_id}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() =>
                                    setActiveUserId(mutual.user_id)
                                  }
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage
                                          src={`https://ipfs.de-id.xyz/ipfs/${mutual.avatar_ipfs_hash}`}
                                          alt={mutual.display_name}
                                        />
                                        <AvatarFallback>
                                          {mutual.display_name?.charAt(0) ||
                                            "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">
                                          {mutual.display_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                          @{mutual.username}
                                        </p>
                                      </div>
                                      <div className="text-right text-sm text-muted-foreground">
                                        <p>
                                          {mutual.followers_number} Followers
                                        </p>
                                        <p>
                                          {mutual.following_number} Following
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="servers" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      {userInfo.mutual_servers_count === 0 ? (
                        <p className="text-muted-foreground text-center">
                          No mutual servers.
                        </p>
                      ) : (
                        <ScrollArea className="h-[48vh] pr-2">
                          <div className="space-y-3">
                            {userInfo.mutual_servers.map(
                              (server: MutualServers) => (
                                <Card key={server.server_id}>
                                  <CardContent className="p-4">
                                    <p className="font-medium">
                                      {server.server_name}
                                    </p>
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex h-[80vh] flex-col md:flex-row">
            <Card className="w-full md:w-80 rounded-none border-0 border-r">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-end gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
                <Separator />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <div className="flex-1 p-6">
              <Card className="h-full">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
