"use client";

import { useParams } from "next/navigation";
import MeCallPage from "@/components/common/MeCallPage";

export default function ServerCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <>
      <MeCallPage callId={channelId} endCall={() => {}} />
    </>
  );
}
