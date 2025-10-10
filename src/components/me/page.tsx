"use client";

import { useState, useEffect } from "react";
import { useDirectMessage } from "@/hooks/useDirectMessage";

interface Conversation {
  userA: string;
  userB: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function MessagePage({
  conversation,
}: {
  conversation: Conversation;
}) {
  const [text, setText] = useState("");
  const { messages, send, loadHistory } = useDirectMessage(conversation?._id);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
