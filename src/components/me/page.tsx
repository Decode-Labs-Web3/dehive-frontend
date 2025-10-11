"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDirectMessage } from "@/hooks/useDirectMessage";

interface Conversation {
  userA: string;
  userB: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: [];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number | 0;
}

export default function MessagePage({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { userId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [editMessageField, setEditMessageField] = useState<
    Record<string, boolean>
  >({});
  const [editMessage, setEditMessage] = useState({
    id: "",
    messageEdit: "",
  });
  const { messages, send, edit, remove, loadHistory, sending, err } =
    useDirectMessage(conversation?._id);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewMessage(e.target.value);
  };

  const handleEditMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const content = editMessage.messageEdit.trim();
      const messageId = editMessage.id;
      if (content && !sending) {
        edit(messageId, content);
        setEditMessage({
          id: "",
          messageEdit: "",
        });
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setEditMessageField(
        Object.fromEntries(messages.map((message) => [message._id, false]))
      );
    }
  };

  const handleNewMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const message = newMessage.trim();
      if (message && !sending) {
        send(message);
        setNewMessage("");
        return;
      }
    }
  };

  const handleEditMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditMessage((prev) => ({ ...prev, messageEdit: e.target.value }));
  };

  const editMessageModal = useCallback(() => {
    setEditMessageField(
      Object.fromEntries(messages.map((message) => [message._id, false]))
    );
  }, [messages]);

  useEffect(() => {
    editMessageModal();
  }, [editMessageModal]);

  return (
    <div className="h-screen w-full bg-blue-500 flex flex-col">
      <div className="sticky top-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-4 py-3">
        <h1>User A: {conversation?.userA}</h1>
        <h1>User B: {conversation?.userB}</h1>
        <h1>Conversation Id: {conversation?._id}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2">
        {messages
          .filter((message) => message.isDeleted === false)
          .slice()
          .reverse()
          .map((message) => (
            <div key={message._id} className="bg-red-400">
              {!editMessageField[message._id] ? (
                <>
                  <h1>{message.senderId}</h1>
                  <p>{message.content}</p>
                  {message.isEdited && <p className="text-blue-300">{"(edited)"}</p>}
                  <p>{String(message.createdAt)}</p>
                  {userId !== message.senderId && (
                    <>
                      <button
                        className="bg-yellow-400 "
                        onClick={() => remove(message._id)}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditMessageField(
                            Object.fromEntries(
                              messages.map((messagelist) => [
                                messagelist._id,
                                messagelist._id === message._id,
                              ])
                            )
                          );
                          setEditMessage({
                            id: message._id,
                            messageEdit: message.content,
                          });
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </>
              ) : (
                <textarea
                  name="editMessage"
                  value={editMessage.messageEdit}
                  onChange={handleEditMessageChange}
                  onKeyDown={handleEditMessageKeyDown}
                  placeholder="Type your message"
                  className="flex-1 rounded-md border px-3 outline-none"
                  disabled={sending}
                />
              )}
            </div>
          ))}
        {sending && <span>Sending...</span>}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/90 border-t px-4 py-3">
        <div className="flex gap-2">
          <textarea
            name="newMessage"
            value={newMessage}
            onChange={handleNewMessageChange}
            onKeyDown={handleNewMessageKeyDown}
            placeholder="Type your message"
            className="flex-1 rounded-md border px-3 outline-none"
            disabled={sending}
          />
        </div>
      </div>
    </div>
  );
}
