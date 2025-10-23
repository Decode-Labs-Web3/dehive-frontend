"use client";

import { useParams } from "next/navigation";
import MeCallPage from "@/components/common/CallPage";

export default function ServerCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <>
      <MeCallPage callId={channelId} endCall={() => {}} />
    </>
  );
}
