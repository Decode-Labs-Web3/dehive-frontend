"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useDirectMessage } from "@/hooks/useDirectMessage";

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
  const [conversation, setConversation] = useState<Conversation>({
    userA: "68dab7c935e367e9a89d0c0b",
    userB: "68de3fc3fb4017f59ab3a38d",
    _id: "68e9294e427297eaeb8f0204",
    createdAt: "2025-10-10T07:52:34.810Z",
    updatedAt: "2025-10-10T07:52:34.810Z",
    __v: 0,
  });
  const [text, setText] = useState("");
  const { messages, send, edit, remove, loadHistory, sending, err } =
    useDirectMessage(conversation?._id);

  // const fetchConversation = useCallback(async () => {
  //   try {
  //     const apiResponse = await fetch(
  //       "/api/me/conversation/conversation-create",
  //       {
  //         method: "POST",
  //         headers: {
  //           "X-Frontend-Internal-Request": "true",
  //         },
  //         body: JSON.stringify({ otherUserDehiveId: userId }),
  //         cache: "no-cache",
  //         signal: AbortSignal.timeout(10000),
  //       }
  //     );

  //     if (!apiResponse.ok) {
  //       console.error(apiResponse);
  //       return;
  //     }

  //     const response = await apiResponse.json();
  //     if (response.statusCode === 200 && response.message === "OK") {
  //       setConversation(response.data);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     console.log("Server create conversation is error");
  //   }
  // }, [userId]);

  // useEffect(() => {
  //   fetchConversation();
  // }, [fetchConversation]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <div className="h-screen w-full bg-blue-500 flex flex-col">
      <div className="sticky top-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-4 py-3">
        <h1>User A: {conversation?.userA}</h1>
        <h1>User B: {conversation?.userB}</h1>
        <h1>Conversation Id: {conversation?._id}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-4 flex flex-col-reverse gap-2">
        {messages
          .slice()
          .reverse()
          .map((message) => (
            <div key={message._id} className="bg-red-400">
              <h1>{message.senderId}</h1>
              <p>{message.content}</p>
              <p>{String(message.createdAt)}</p>
            </div>
          ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-4 py-3">
        <div className="flex gap-2">
          <input
            name="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message"
            className="flex-1 h-10 rounded-md border px-3 outline-none"
          />
          <button
            onClick={() => {
              send(text);
              setText("");
            }}
            className="h-10 px-4 rounded-md bg-red-500 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
