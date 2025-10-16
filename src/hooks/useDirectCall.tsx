"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import type {
  SignalOfferInbound,
  SignalAnswerInbound,
  IceCandidateInbound,
} from "@/interfaces/websocketMeCall.interfaces";

type RTCSrv = { urls: string; username?: string; credential?: string };

type IncomingCall = {
  call_id: string;
  caller_id: string;
  caller_info?: unknown;
  with_video: boolean;
  with_audio: boolean;
  timestamp?: string;
};

export function useDirectCall() {
  const socket = useRef(getMeCallSocketIO()).current;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const makingPcRef = useRef(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCSrv[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  // --- Fetch ICE: trả về mảng để dùng ngay, đồng thời cập nhật state để lần sau có sẵn
  const fetchIceServers = useCallback(async (): Promise<RTCSrv[]> => {
    const apiResponse = await fetch("/api/me/call", {
      method: "GET",
      headers: { "X-Frontend-Internal-Request": "true" },
      cache: "no-cache",
      signal: AbortSignal.timeout(10000),
    });
    if (!apiResponse.ok) throw new Error("fetch ICE failed");

    const res = await apiResponse.json();
    if (
      res?.statusCode === 200 &&
      res?.message === "ICE servers retrieved successfully" &&
      Array.isArray(res?.data?.iceServers)
    ) {
      setIceServers(res.data.iceServers);
      return res.data.iceServers as RTCSrv[];
    }
    throw new Error("bad ICE payload");
  }, []);

  useEffect(() => {
    // Preload ICE 1 lần khi mount (để user bấm gọi là có ngay)
    fetchIceServers().catch(() => {});
  }, [fetchIceServers]);

  // --- Tạo PC + xin media local + đăng ký handler
  const ensurePc = useCallback(async (): Promise<RTCPeerConnection> => {
    if (pcRef.current) return pcRef.current;
    if (makingPcRef.current) {
      // nếu đang tạo, chờ tới khi có
      await new Promise((r) => setTimeout(r, 30));
      return ensurePc();
    }
    makingPcRef.current = true;

    let ice = iceServers;
    if (!ice || ice.length === 0) {
      try {
        ice = await fetchIceServers();
      } catch {
        // fallback: vẫn tạo PC với rỗng (trình duyệt mặc định có thể tự có STUN public)
        ice = [];
      }
    }

    const pc = new RTCPeerConnection({ iceServers: ice as RTCIceServer[] });
    pcRef.current = pc;

    // 1) Local media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setLocalStream(stream);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    // 2) ICE outbound
    pc.onicecandidate = (e) => {
      if (!e.candidate || !callId) return;
      socket.emit("iceCandidate", {
        call_id: callId,
        candidate: e.candidate.toJSON(),
      });
    };

    // 3) Remote inbound
    pc.ontrack = (e) => {
      const rs = e.streams?.[0] ?? new MediaStream([e.track]);
      setRemoteStream((prev) => prev ?? rs);
      if (!e.streams?.length) {
        // Trường hợp một số browser chỉ đẩy track
        setRemoteStream((prev) => {
          const ms = prev ?? new MediaStream();
          ms.addTrack(e.track);
          return ms;
        });
      }
    };

    // 4) Auto cleanup khi fail/closed
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        endCall();
      }
    };

    makingPcRef.current = false;
    return pc;
  }, [callId, iceServers, fetchIceServers, socket]);

  // ============ Caller ============
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

  // Caller nhận callStarted -> tạo offer và gửi
  useEffect(() => {
    const onCallStarted = async (p: { call_id: string }) => {
      setCallId(p.call_id);
      const pc = await ensurePc();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("signalOffer", { call_id: p.call_id, offer });
    };

    socket.on("callStarted", onCallStarted);

    // cleanup void
    return () => {
      socket.off("callStarted", onCallStarted);
    };
  }, [socket, ensurePc]);

  // ============ Callee ============
  // Chuông tới
  useEffect(() => {
    const onIncoming = (p: IncomingCall) => setIncomingCall(p);
    socket.on("incomingCall", onIncoming);
    return () => {
      socket.off("incomingCall", onIncoming);
    };
  }, [socket]);

  const acceptCall = useCallback(
    async (cid: string) => {
      setCallId(cid);
      await ensurePc();
      socket.emit("acceptCall", {
        call_id: cid,
        with_video: true,
        with_audio: true,
      });
      setIncomingCall(null);
    },
    [ensurePc, socket]
  );

  const declineCall = useCallback(
    (cid: string) => {
      socket.emit("declineCall", { call_id: cid });
      setIncomingCall(null);
    },
    [socket]
  );

  useEffect(() => {
    const onDeclined = () => setIncomingCall(null);
    socket.on("callDeclined", onDeclined);
    return () => {
      socket.off("callDeclined", onDeclined);
    };
  }, [socket]);

  useEffect(() => {
    const onAccepted = (_: { call_id: string }) => {
      // tùy UI: hiển thị "Connecting..." hoặc đổi trạng thái
    };
    socket.on("callAccepted", onAccepted);
    return () => {
      socket.off("callAccepted", onAccepted);
    };
  }, [socket]);

  // ============ Signaling ============
  // Callee nhận offer -> setRemote -> tạo answer -> gửi
  useEffect(() => {
    const onSignalOffer = async (data: SignalOfferInbound) => {
      if (!callId) setCallId(data.call_id);
      const pc = await ensurePc();
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("signalAnswer", { call_id: data.call_id, answer });
    };
    socket.on("signalOffer", onSignalOffer);
    return () => {
      socket.off("signalOffer", onSignalOffer);
    };
  }, [socket, ensurePc, callId]);

  // Caller nhận answer -> setRemote
  useEffect(() => {
    const onSignalAnswer = async (data: SignalAnswerInbound) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    };
    socket.on("signalAnswer", onSignalAnswer);
    return () => {
      socket.off("signalAnswer", onSignalAnswer);
    };
  }, [socket]);

  // ICE inbound
  useEffect(() => {
    const onIce = async (data: IceCandidateInbound) => {
      const pc = pcRef.current;
      if (!pc || !data.candidate) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.warn("addIceCandidate error", e);
      }
    };
    socket.on("iceCandidate", onIce);
    return () => {
      socket.off("iceCandidate", onIce);
    };
  }, [socket]);

  // ============ cleanup ============
  const endCall = useCallback(() => {
    if (callId) socket.emit("endCall", { call_id: callId });
    try {
      pcRef.current?.getSenders().forEach((s) => {
        try {
          s.track?.stop();
        } catch {}
      });
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallId(null);
    setIncomingCall(null);
  }, [socket, callId, localStream]);

  useEffect(() => {
    const onEnded = () => endCall();
    socket.on("callEnded", onEnded);
    return () => {
      socket.off("callEnded", onEnded);
    };
  }, [socket, endCall]);

  useEffect(() => () => endCall(), [endCall]);

  return {
    // state
    callId,
    localStream,
    remoteStream,
    incomingCall,
    // actions
    startCall, // caller starts
    acceptCall, // callee accepts
    declineCall, // callee declines
    endCall, // either side hangs up
    // local toggles (broadcast thêm nếu bạn muốn)
    muteMic: (on: boolean) =>
      localStream?.getAudioTracks().forEach((t) => (t.enabled = on)),
    muteCam: (on: boolean) =>
      localStream?.getVideoTracks().forEach((t) => (t.enabled = on)),
  };
}
