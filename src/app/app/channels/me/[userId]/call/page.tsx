"use client";

import { useEffect, useMemo, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useParams } from "next/navigation";

type TokenResponse = { apiKey: string; token: string; userId: string };

export default function DirectCallPage() {
  const { userId: targetUserId } = useParams() as { userId: string };

  const [meId, setMeId] = useState<string>("");
  useEffect(() => {
    const k = "stream_me_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = `u_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(k, id);
    }
    setMeId(id);
  }, []);

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<
    StreamVideoClient["call"]
  > | null>(null);

  useEffect(() => {
    if (!meId) return;
    (async () => {
      const res = await fetch(
        `/api/stream/token?userId=${encodeURIComponent(meId)}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch stream token");
        return;
      }
      const { apiKey, token, userId }: TokenResponse = await res.json();
      const c = new StreamVideoClient({ apiKey, user: { id: userId }, token });
      setClient(c);
    })();
  }, [meId]);

  const callId = useMemo(
    () => (meId && targetUserId ? `dm_${meId}_${targetUserId}` : ""),
    [meId, targetUserId]
  );

  const join = async () => {
    if (!client || !callId) return;
    const _call = client.call("default", callId);
    await _call.join({ create: true });
    setCall(_call);
  };

  const leave = async () => {
    try {
      await call?.leave();
    } catch {}
    setCall(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b1614] text-white p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Direct Call</h1>
        {!call ? (
          <button
            onClick={join}
            className="rounded-xl px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
            disabled={!client || !callId}
          >
            📞 Call User #{targetUserId}
          </button>
        ) : (
          <button
            onClick={leave}
            className="rounded-xl px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
          >
            ✕ Leave
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div className="h-full flex flex-col gap-4">
                <div className="flex-1 min-h-0 rounded-xl overflow-hidden bg-[#191b22]">
                  <SpeakerLayout />
                </div>
                <div className="flex justify-center">
                  <CallControls />
                </div>
              </div>
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="h-full rounded-xl bg-[#191b22] flex items-center justify-center text-gray-300">
            {client ? "Ready to start the call." : "Initializing…"}
          </div>
        )}
      </div>
    </div>
  );
}
