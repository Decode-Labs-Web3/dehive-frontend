"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import type {
  SignalOfferInbound,
  SignalAnswerInbound,
  IceCandidateInbound,
  IncomingCallPayload,
  ToggleMediaInbound,
} from "@/interfaces/websocketMeCall.interfaces";

interface RTCServer {
  urls: string;
  username?: string;
  credential?: string;
}

export function useDirectCall() {
  const socket = useRef(getMeCallSocketIO()).current;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const makingPcRef = useRef(false);
  const callIdRef = useRef<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCServer[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(
    null
  );

  const fetchIceServers = useCallback(async (): Promise<RTCServer[]> => {
    try {
      const r = await fetch("/api/me/call", {
        method: "GET",
        headers: { "X-Frontend-Internal-Request": "true" },
        cache: "no-cache",
      });
      if (!r.ok) return [];
      const j = await r.json();
      const servers = (j?.data?.iceServers ?? []) as RTCServer[];
      setIceServers(servers);
      return servers;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    fetchIceServers().catch(() => {});
  }, [fetchIceServers]);
  useEffect(() => {
    callIdRef.current = callId;
  }, [callId]);

  const initMedia = useCallback(async () => {
    if (localStream) return localStream;
    const s = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    s.getAudioTracks().forEach((t) => (t.enabled = true));
    s.getVideoTracks().forEach((t) => (t.enabled = true));
    setLocalStream(s);
    return s;
  }, [localStream]);

  function isPcUsable(pc: RTCPeerConnection | null) {
    if (!pc) return false;
    return pc.signalingState !== "closed" && pc.connectionState !== "closed";
  }

  const ensurePc = useCallback(async (): Promise<RTCPeerConnection> => {
    if (pcRef.current && !isPcUsable(pcRef.current)) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (pcRef.current) return pcRef.current;
    if (makingPcRef.current) {
      await new Promise((r) => setTimeout(r, 30));
      return ensurePc();
    }
    makingPcRef.current = true;

    const ice = iceServers.length
      ? iceServers
      : await fetchIceServers().catch(() => []);
    const createPc = () => {
      const next = new RTCPeerConnection({
        iceServers: ice as unknown as RTCIceServer[],
      });
      pcRef.current = next;
      next.onicecandidate = (e) => {
        if (!e.candidate || !callIdRef.current) return;
        socket.emit("iceCandidate", {
          call_id: callIdRef.current,
          candidate: e.candidate.toJSON(),
        });
      };
      next.ontrack = (e) => {
        if (e.streams?.length) setRemoteStream(e.streams[0]);
        else {
          setRemoteStream((prev) => {
            if (!prev) return new MediaStream([e.track]);
            const has = prev.getTracks().some((t) => t.id === e.track.id);
            if (!has) prev.addTrack(e.track);
            return new MediaStream(prev.getTracks());
          });
        }
      };
      next.onconnectionstatechange = () => {
        console.log("[pc]", next.connectionState, next.signalingState);
      };
      return next;
    };

    let pc = createPc();

    let stream: MediaStream;
    try {
      stream = await initMedia();
    } catch (e) {
      makingPcRef.current = false;
      try {
        pc.close();
      } catch {}
      pcRef.current = null;
      throw e;
    }

    if (!isPcUsable(pc)) {
      try {
        pc.close();
      } catch {}
      pc = createPc();
    }
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    makingPcRef.current = false;
    return pc;
  }, [socket, iceServers, fetchIceServers, initMedia]);

  const startCall = useCallback(
    async (targetUserId: string) => {
      socket.emit("startCall", {
        target_user_id: targetUserId,
        with_video: true,
        with_audio: true,
      });
    },
    [socket]
  );

  useEffect(() => {
    const onCallStarted = async (p: { call_id: string }) => {
      setCallId(p.call_id);
      callIdRef.current = p.call_id;
      try {
        const pc = await ensurePc();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signalOffer", { call_id: p.call_id, offer });
      } catch (e) {
        console.error("[call] ensurePc failed:", e);
      }
    };
    socket.on("callStarted", onCallStarted);
    return () => socket.off("callStarted", onCallStarted);
  }, [socket, ensurePc]);

  useEffect(() => {
    const onIncoming = (p: IncomingCallPayload) => setIncomingCall(p);
    socket.on("incomingCall", onIncoming);
    return () => socket.off("incomingCall", onIncoming);
  }, [socket]);

  const acceptCall = useCallback(
    async (call_id: string) => {
      setCallId(call_id);
      callIdRef.current = call_id;
      await ensurePc();
      socket.emit("acceptCall", {
        call_id,
        with_video: true,
        with_audio: true,
      });
      setIncomingCall(null);
    },
    [ensurePc, socket]
  );

  const declineCall = useCallback(
    (call_id: string) => {
      socket.emit("declineCall", { call_id });
      setIncomingCall(null);
    },
    [socket]
  );

  useEffect(() => {
    const onSignalOffer = async (d: SignalOfferInbound) => {
      if (!callIdRef.current) {
        setCallId(d.call_id);
        callIdRef.current = d.call_id;
      }
      const pc = await ensurePc();
      await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("signalAnswer", { call_id: d.call_id, answer });
    };
    socket.on("signalOffer", onSignalOffer);
    return () => socket.off("signalOffer", onSignalOffer);
  }, [socket, ensurePc]);

  useEffect(() => {
    const onSignalAnswer = async (d: SignalAnswerInbound) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(d.answer));
    };
    socket.on("signalAnswer", onSignalAnswer);
    return () => socket.off("signalAnswer", onSignalAnswer);
  }, [socket]);

  useEffect(() => {
    const onIce = async (d: IceCandidateInbound) => {
      const pc = pcRef.current;
      if (!pc || !d.candidate) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(d.candidate));
      } catch {}
    };
    socket.on("iceCandidate", onIce);
    return () => socket.off("iceCandidate", onIce);
  }, [socket]);

  useEffect(() => {
    const onMediaToggled = (_: ToggleMediaInbound) => {};
    socket.on("mediaToggled", onMediaToggled);
    return () => socket.off("mediaToggled", onMediaToggled);
  }, [socket]);

  const endCall = useCallback(() => {
    if (callIdRef.current)
      socket.emit("endCall", { call_id: callIdRef.current });
    try {
      pcRef.current?.getSenders().forEach((s) => {
        try {
          s.track?.stop();
        } catch {}
      });
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;
    makingPcRef.current = false;
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallId(null);
    callIdRef.current = null;
    setIncomingCall(null);
  }, [socket, localStream, remoteStream]);

  useEffect(() => {
    const onEnded = () => endCall();
    socket.on("callEnded", onEnded);
    return () => socket.off("callEnded", onEnded);
  }, [socket, endCall]);

  return {
    callId,
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    initMedia,
    muteMic: (on: boolean) => {
      localStream?.getAudioTracks().forEach((t) => (t.enabled = on));
      if (callIdRef.current)
        socket.emit("toggleMedia", {
          call_id: callIdRef.current,
          media_type: "audio",
          state: on ? "enabled" : "disabled",
        });
    },
    muteCam: (on: boolean) => {
      localStream?.getVideoTracks().forEach((t) => (t.enabled = on));
      if (callIdRef.current)
        socket.emit("toggleMedia", {
          call_id: callIdRef.current,
          media_type: "video",
          state: on ? "enabled" : "disabled",
        });
    },
  };
} // <- Kết thúc file, KHÔNG đặt thêm code gọi hook bên dưới
