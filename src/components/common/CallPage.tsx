"use client";

import {
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type User,
  type Call,
  // ToggleAudioPublishingButton,
  // ToggleVideoPublishingButton,
  // ScreenShareButton,
  ReactionsButton,
  CancelCallButton,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, useCallback, useMemo } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

function MicButton({ onAfter }: { onAfter?: () => void }) {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();

  return (
    <button
      onClick={async () => {
        await microphone.toggle();
        onAfter?.();
      }}
    >
      {isMute ? "Unmute" : "Mute"}
    </button>
  );
}

function CamButton({ onAfter }: { onAfter?: () => void }) {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();

  return (
    <button
      onClick={async () => {
        await camera.toggle();
        onAfter?.();
      }}
    >
      {isMute ? "Camera On" : "Camera Off"}
    </button>
  );
}

function ScreenShareBtn({ onAfter }: { onAfter?: () => void }) {
  const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
  const { screenShare, status } = useScreenShareState();
  const someoneSharing = useHasOngoingScreenShare();
  const isSharing = status === "enabled";

  return (
    <button
      disabled={!isSharing && someoneSharing}
      onClick={async () => {
        try {
          await screenShare.toggle();
          onAfter?.();
        } catch (e) {
          console.warn("screenshare toggle failed:", e);
        }
      }}
    >
      {isSharing ? "Stop Share" : "Share Screen"}
    </button>
  );
}

interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_active: boolean;
}

interface CallPageProps {
  callId: string;
  endCall: () => void;
}

export default function CallPage({ callId, endCall }: CallPageProps) {
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUserData(JSON.parse(userData));
    }
  }, []);

  const user = useMemo(() => {
    if (!userData) return null;
    return {
      id: userData._id,
      name: userData.display_name,
      image: `https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`,
    } as User;
  }, [userData]);

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey: string = process.env.NEXT_PUBLIC_STREAM_KEY!;
  const [token, setToken] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const apiResponse = await fetch("/api/stream/token", {
      method: "GET",
      headers: {
        "X-Frontend-Internal-Request": "true",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      console.error("this is error", error);
      return;
    }
    const response = await apiResponse.json();
    // console.log("this is data from callPage", response);
    setToken(response.data.token);
  }, []);

  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    if (!token) return;
    const streamVideoClient = new StreamVideoClient({
      apiKey: apiKey,
      user: user!,
      token: token!,
    });
    const streamCall = streamVideoClient.call("default", callId);

    streamCall
      .join({
        create: true,
        video: false,
      })
      .then(async () => {
        try {
          await streamCall.camera.disable();
          await streamCall.microphone.disable();
        } catch (error) {
          console.log("Camera/mic already disabled or error:", error);
        }

        setClient(streamVideoClient);
        setCall(streamCall);
        setError(null);
      })
      .catch((error) => {
        console.error("Failed to join call:", error);
        setError(error.message || "Failed to join call");
      });

    return () => {
      if (streamCall) {
        streamCall.leave().catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/already been left/i.test(msg)) {
            console.error("Error leaving stream call during cleanup:", err);
          }
        });
      }
    };
  }, [token, apiKey, callId, user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            You may have hit the rate limit. Please wait a few minutes and try
            again.
          </p>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      {token && call && (
        <StreamCall call={call}>
          <MyUILayout endCall={endCall} />
        </StreamCall>
      )}
    </StreamVideo>
  );
}

const MyUILayout = ({ endCall }: { endCall: () => void }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <div className="flex justify-center items-center gap-4 p-4">
        <ReactionsButton />
        {/* <ToggleAudioPublishingButton /> */}
        {/* <ToggleVideoPublishingButton /> */}
        {/* <ScreenShareButton /> */}
        <MicButton onAfter={() => console.log("mic toggled")} />
        <CamButton onAfter={() => console.log("cam toggled")} />
        <ScreenShareBtn onAfter={() => console.log("screen toggled")} />

        <CancelCallButton
          onLeave={() => {
            endCall();
          }}
        />
      </div>
    </StreamTheme>
  );
};
