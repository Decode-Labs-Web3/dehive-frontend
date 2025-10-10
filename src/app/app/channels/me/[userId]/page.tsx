"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

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

  const [data, setData] = useState<Conversation>();

  const fetchConversation = useCallback(async () => {
    try {
      const apiResponse = await fetch(
        "/api/me/conversation/create-conversation",
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
        setData(response.data)
      }
    } catch (error) {
      console.error(error);
      console.log("Server create conversation is error");
    }
  }, []);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return (
    <>
      <h1>User A: {data?.userA}</h1>
      <h1>User B: {data?.userB}</h1>
      <h1>Conversation Id: {data?._id}</h1>
    </>
  );
}
