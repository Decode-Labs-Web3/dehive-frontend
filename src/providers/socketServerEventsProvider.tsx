"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useServersList } from "@/hooks/useServersList";
import { useServerMember } from "@/hooks/useServerMember";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { getServerEventsSocketIO } from "@/lib/socketioServerEventsSingleton";
import type {
  ServerToClientServerEvents,
  IdentityConfirmedEvent,
  ServerJoinedEvent,
  ServerDeletedEvent,
  UserKickedEvent,
  UserBannedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
  CategoryCreatedEvent,
  CategoryUpdatedEvent,
  CategoryDeletedEvent,
  ChannelCreatedEvent,
  ChannelUpdatedEvent,
  ChannelDeletedEvent,
  ChannelMovedEvent,
  WsErrorPayload,
  ServerInfoUpdatedEvent,
  ServerAvatarUpdatedEvent,
  ServerTagsUpdatedEvent,
  ServerNFTUpdatedEvent,
  ServerOwnershipUpdatedEvent,
} from "@/interfaces/websocketServerEvents.interface";

interface SocketServerEventsProviderProps {
  userId: string;
  serverId?: string;
  children: React.ReactNode;
}

export default function SocketServerEventsProvider({
  userId,
  serverId,
  children,
}: SocketServerEventsProviderProps) {
  const router = useRouter();
  const {
    deleteServerRoot,
    createCategoryRoot,
    updateCategoryRoot,
    deleteCategoryRoot,
    moveChannelRoot,
    createChannelRoot,
    editChannelRoot,
    deleteChannelRoot,
  } = useServerRoot();
  const {
    removeServerList,
    updateServerInfomationList,
    updateServerTagsList,
    updateServerAvatarList,
    updateServerNFTGatingList,
    updateServerOwnershipList,
  } = useServersList();
  const {
    updateServerInfomation,
    updateServerTagInfomation,
    updateServerNFTInformation,
    removeServerInfomation,
    updateServerAvatarInfomation,
    updateServerOwnershipInfomation,
  } = useServerInfomation();
  const { updateUserLeaveMember, updateUserJoinMember } = useServerMember();
  const socket = useRef(getServerEventsSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (!userId) return;
      socket.emit("identity", userId);
    };

    const tryJoinServer = () => {
      if (!serverId) return;
      socket.emit("joinServer", { serverId });
    };

    const onConnect = () => {
      console.log("[server-events ws connect]", socket.id);
      identify();
    };

    const onDisconnect = (reason: string) => {
      console.log("[server-events ws disconnect]", reason);
    };

    const onConnectError = (err: Error) => {
      console.warn("[server-events ws connect_error]", err);
    };

    const onError = (e: WsErrorPayload | string) => {
      console.warn("[server-events ws error]", e);
    };

    const onManagerReconnect = (n: number) => {
      console.log("[server-events ws reconnect]", n);
      identify();
    };

    const onManagerReconnectAttempt = (n: number) => {
      console.log("[server-events ws reconnect_attempt]", n);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[server-events ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[server-events ws reconnect_failed]");
    };

    const onDebug = (p: { message: string }) => {
      console.log("[server-events debug]", p);
    };

    const onIdentityConfirmed = (p: IdentityConfirmedEvent | string) => {
      console.log("[server-events identityConfirmed]", p);
      tryJoinServer();
    };

    const onServerJoined = (p: ServerJoinedEvent) => {
      console.log("[server-events serverJoined]", p);
    };

    // Level 1: user-level events
    const onServerDeleted = (p: ServerDeletedEvent) => {
      console.log("[server-events server:deleted]", p);
      removeServerList(p.serverId);
      if (serverId === p.serverId) {
        deleteServerRoot();
        removeServerInfomation();
        router.push("/app/channels/me");
      }
    };

    const onUserKicked = (p: UserKickedEvent) => {
      console.log("[server-events server:kicked]", p);
      if (userId === p.userId) {
        removeServerList(p.serverId);
        if (serverId === p.serverId) {
          deleteServerRoot();
          removeServerInfomation();
          router.push("/app/channels/me");
        }
      }
    };

    const onServerInfoUpdated = (p: ServerInfoUpdatedEvent) => {
      console.log("[server-events server:info-updated]", p);
      updateServerInfomationList(p.server_id, p.name, p.description);
      if (serverId === p.server_id) {
        updateServerInfomation(p.name, p.description);
      }
    };

    const onServerAvatarUpdated = (p: ServerAvatarUpdatedEvent) => {
      console.log("[server-events server:avatar-updated]", p);
      updateServerAvatarList(p.server_id, p.avatar_hash);
      if (serverId === p.server_id) {
        updateServerAvatarInfomation(p.avatar_hash);
      }
    };

    const onServerTagsUpdated = (p: ServerTagsUpdatedEvent) => {
      console.log("[server-events server:tags-updated]", p);
      updateServerTagsList(p.server_id, p.tags[0]);
      if (serverId === p.server_id) {
        updateServerTagInfomation(p.tags[0]);
      }
    };

    const onServerNFTUpdated = (p: ServerNFTUpdatedEvent) => {
      console.log("[server-events server:nft-updated]", p);
      updateServerNFTGatingList(p.server_id, p.server);
      if (serverId === p.server_id) {
        updateServerNFTInformation(p.server);
      }
    };

    const onUserBanned = (p: UserBannedEvent) => {
      console.log("[server-events server:banned]", p);
      if (userId === p.userId) {
        removeServerList(p.serverId);
        if (serverId === p.serverId) {
          deleteServerRoot();
          removeServerInfomation();
          router.push("/app/channels/me");
        }
      }
    };

    // Level 2: server-level events
    const onMemberJoined = (p: MemberJoinedEvent) => {
      console.log("[server-events member:joined]", p);
      updateUserJoinMember(p.member);
    };

    const onMemberLeft = (p: MemberLeftEvent) => {
      console.log("[server-events member:left]", p);
      updateUserLeaveMember(p.member.userId);
    };

    const onCategoryCreated = (p: CategoryCreatedEvent) => {
      console.log("[server-events category:created]", p);
      createCategoryRoot({
        _id: p._id,
        name: p.name,
        server_id: p.server_id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        __v: p.__v,
        channels: [],
      });
    };

    const onCategoryUpdated = (p: CategoryUpdatedEvent) => {
      console.log("[server-events category:updated]", p);
      updateCategoryRoot(p.categoryId, p.name);
    };

    const onCategoryDeleted = (p: CategoryDeletedEvent) => {
      console.log("[server-events category:deleted]", p);
      deleteCategoryRoot(p.categoryId);
    };

    const onChannelCreated = (p: ChannelCreatedEvent) => {
      console.log("[server-events channel:created]", p);
      createChannelRoot({
        _id: p._id,
        name: p.name,
        type: p.type,
        category_id: p.category_id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        __v: p.__v,
      });
    };

    const onChannelUpdated = (p: ChannelUpdatedEvent) => {
      console.log("[server-events channel:updated]", p);
      editChannelRoot(p._id, p.name);
    };

    const onChannelDeleted = (p: ChannelDeletedEvent) => {
      console.log("[server-events channel:deleted]", p);
      deleteChannelRoot(p.channelId);
    };

    const onChannelMoved = (p: ChannelMovedEvent) => {
      console.log("[server-events channel:moved]", p);
      moveChannelRoot(
        p.channel.oldCategoryId,
        p.channel.newCategoryId,
        p.channel._id
      );
    };

    const onServerOwnershipUpdated = (p: ServerOwnershipUpdatedEvent) => {
      console.log("[server-events server:updated-ownership]", p);
      console.log("ewkdnwednweidknwejkdnewjdkwendkjwejndkwejd", p)
      updateServerOwnershipList(p.server_id, p.owner_id);
      if (serverId === p.server_id) {
        updateServerOwnershipInfomation(p.owner_id);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError as ServerToClientServerEvents["error"]);

    socket.io.on("reconnect", onManagerReconnect);
    socket.io.on("reconnect_attempt", onManagerReconnectAttempt);
    socket.io.on("reconnect_error", onManagerReconnectError);
    socket.io.on("reconnect_failed", onManagerReconnectFailed);

    socket.on("debug", onDebug);
    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.on("serverJoined", onServerJoined);

    // Level 1
    socket.on("server:deleted", onServerDeleted);
    socket.on("server:info-updated", onServerInfoUpdated);
    socket.on("server:avatar-updated", onServerAvatarUpdated);
    socket.on("server:tags-updated", onServerTagsUpdated);
    socket.on("server:nft-updated", onServerNFTUpdated);
    socket.on("server:kicked", onUserKicked);
    socket.on("server:banned", onUserBanned);
    socket.on("server:updated-ownership", onServerOwnershipUpdated);

    // Level 2
    socket.on("member:joined", onMemberJoined);
    socket.on("member:left", onMemberLeft);
    socket.on("category:created", onCategoryCreated);
    socket.on("category:updated", onCategoryUpdated);
    socket.on("category:deleted", onCategoryDeleted);
    socket.on("channel:created", onChannelCreated);
    socket.on("channel:updated", onChannelUpdated);
    socket.on("channel:deleted", onChannelDeleted);
    socket.on("channel:moved", onChannelMoved);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError as ServerToClientServerEvents["error"]);

      socket.io.off("reconnect", onManagerReconnect);
      socket.io.off("reconnect_attempt", onManagerReconnectAttempt);
      socket.io.off("reconnect_error", onManagerReconnectError);
      socket.io.off("reconnect_failed", onManagerReconnectFailed);

      socket.off("debug", onDebug);
      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.off("serverJoined", onServerJoined);

      socket.off("server:deleted", onServerDeleted);
      socket.off("server:info-updated", onServerInfoUpdated);
      socket.off("server:avatar-updated", onServerAvatarUpdated);
      socket.off("server:tags-updated", onServerTagsUpdated);
      socket.off("server:nft-updated", onServerNFTUpdated);
      socket.off("server:kicked", onUserKicked);
      socket.off("server:banned", onUserBanned);
      socket.off("server:updated-ownership", onServerOwnershipUpdated);

      socket.off("member:joined", onMemberJoined);
      socket.off("member:left", onMemberLeft);
      socket.off("category:created", onCategoryCreated);
      socket.off("category:updated", onCategoryUpdated);
      socket.off("category:deleted", onCategoryDeleted);
      socket.off("channel:created", onChannelCreated);
      socket.off("channel:updated", onChannelUpdated);
      socket.off("channel:deleted", onChannelDeleted);
      socket.off("channel:moved", onChannelMoved);
    };
  }, [
    socket,
    userId,
    serverId,
    router,
    updateUserJoinMember,
    updateUserLeaveMember,
    editChannelRoot,
    moveChannelRoot,
    deleteServerRoot,
    deleteChannelRoot,
    createChannelRoot,
    createCategoryRoot,
    updateCategoryRoot,
    deleteCategoryRoot,
    removeServerList,
    updateServerTagsList,
    updateServerAvatarList,
    updateServerNFTGatingList,
    updateServerInfomationList,
    removeServerInfomation,
    updateServerInfomation,
    updateServerTagInfomation,
    updateServerNFTInformation,
    updateServerAvatarInfomation,
    updateServerOwnershipList,
    updateServerOwnershipInfomation,
  ]);

  useEffect(() => {
    if (userId && socket.connected) socket.emit("identity", userId);
  }, [userId, socket]);

  useEffect(() => {
    if (serverId && socket.connected) socket.emit("joinServer", { serverId });
  }, [serverId, socket]);

  return <>{children}</>;
}
