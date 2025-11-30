"use client";

import { useUser } from "@/hooks/useUser";
import { useAudioSetting } from "@/hooks/useAudioSetting";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faDisplay,
  faCircleStop,
} from "@fortawesome/free-solid-svg-icons";
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
  ReactionsButton,
  CancelCallButton,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

function MicButton({ onAfter }: { onAfter?: () => void }) {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const { updateMicrophone } = useAudioSetting();
  return (
    <button
      onClick={async () => {
        await microphone.toggle();
        updateMicrophone(isMute);
        onAfter?.();
      }}
    >
      <FontAwesomeIcon icon={isMute ? faMicrophoneSlash : faMicrophone} />
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
      <FontAwesomeIcon icon={isMute ? faVideoSlash : faVideo} />
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
        await screenShare.toggle();
        onAfter?.();
      }}
    >
      <FontAwesomeIcon icon={isSharing ? faCircleStop : faDisplay} />
    </button>
  );
}

interface CallPageProps {
  callId: string;
  endCall: () => void;
}

export default function DirectCallStreamIOPage({
  callId,
  endCall,
}: CallPageProps) {
  const { user } = useUser();
  const { audioSetting } = useAudioSetting();
  const userData = useMemo(() => {
    if (!user) return null;
    return {
      id: user._id,
      name: user.display_name,
      image: `https://ipfs.io/ipfs/${user.avatar_ipfs_hash}`,
    } as User;
  }, [user]);

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
        "X-User-Id": user._id,
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
  }, [user._id]);

  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    if (!token) return;
    const streamVideoClient = new StreamVideoClient({
      apiKey: apiKey,
      user: userData!,
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
  }, [token, apiKey, callId, user, userData]);

  useEffect(() => {
    if (call && call.microphone) {
      if (audioSetting.microphone) {
        call.microphone.enable();
      } else {
        call.microphone.disable();
      }
    }
  }, [audioSetting.microphone, call]);

  useEffect(() => {
    if (call && call.speaker) {
      if (audioSetting.speaker) {
        call.speaker.setVolume(1);
      } else {
        call.speaker.setVolume(0);
      }
    }
  }, [audioSetting.speaker, call]);

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
