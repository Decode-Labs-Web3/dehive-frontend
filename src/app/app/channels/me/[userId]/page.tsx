"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import MessagePage from "@/components/me/page";

interface Conversation {
  userA: string;
  userB: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function DirectMessagePage() {
  const { userId } = useParams();
  const [conversation, setConversation] = useState<Conversation>();

  const fetchConversation = useCallback(async () => {
    try {
      const apiResponse = await fetch(
        "/api/me/conversation/conversation-create",
        {
          method: "POST",
          headers: {
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({ otherUserDehiveId: userId }),
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
        setConversation(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server create conversation is error");
    }
  }, [userId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return conversation ? <MessagePage conversation={conversation} /> : null;
}
