"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { faX } from "@fortawesome/free-solid-svg-icons";
import FilePreview from "@/components/common/FilePreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileUploadProps } from "@/interfaces/message.interface";

interface MessageInputProps {
  optionComponent: React.ReactNode;
  messageReply: any;
  onReplyCancel: () => void;
  newMessage: {
    content: string;
    uploadIds: string[];
    replyTo: string | null;
  };
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMessageKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextareaClick: () => void;
  listUploadFile: FileUploadProps[];
  setListUploadFile: React.Dispatch<React.SetStateAction<FileUploadProps[]>>;
  sending: boolean;
  newMessageRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MessageInput({
  optionComponent,
  messageReply,
  onReplyCancel,
  newMessage,
  onMessageChange,
  onMessageKeyDown,
  onTextareaClick,
  listUploadFile,
  setListUploadFile,
  sending,
  newMessageRef,
}: MessageInputProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-4 backdrop-blur">
      <div className="flex items-end gap-3 rounded-2xl bg-secondary p-3 shadow-lg w-full">
        {optionComponent}
        <div className="flex-1">
          <FilePreview
            listUploadFile={listUploadFile}
            setListUploadFile={setListUploadFile}
          />
          {messageReply && (
            <div className="flex justify-between items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-muted border-l-4 border-accent">
              <div>
                <span className="text-xs font-semibold text-accent">
                  Replying to {messageReply.sender.display_name}
                </span>
                <span className="truncate text-xs text-foreground">
                  {messageReply.content}
                </span>
              </div>
              <Button
                onClick={onReplyCancel}
                className="text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faX} />
              </Button>
            </div>
          )}
          <Textarea
            ref={newMessageRef}
            name="content"
            value={newMessage.content}
            onChange={onMessageChange}
            onKeyDown={onMessageKeyDown}
            onClick={onTextareaClick}
            placeholder="Message"
            disabled={sending}
            className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border placeholder-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
