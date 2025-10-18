"use client";

import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  type User,
  type Call,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, useCallback } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

// const apiKey = "mmhfdzb5evj2";
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0xpbWVfU3Byb3V0IiwidXNlcl9pZCI6IkxpbWVfU3Byb3V0IiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NjA3NzQ4ODcsImV4cCI6MTc2MTM3OTY4N30.bkxIpYHLXqm4nL6vbW-qmS4_jb41OBiryZtvEgMAueM";
// const userId = "Lime_Sprout";
// const callId = "u2RO5s5OwzhH040HBfj9w";

// set up the user object

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

export default function App() {
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUserData(JSON.parse(userData));
    }
  }, []);

  let user: User | null = null;

  if (userData) {
    user = {
      id: userData._id,
      name: userData.display_name,
      image: `https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`,
    } as User;
  }

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey: string = process.env.NEXT_PUBLIC_STREAM_KEY!;
  const callId: string = "minh";
  const [token, setToken] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const apiResponse = await fetch("/api/stream/stream-token", {
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
    console.log("this is data", response);
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

    // Join the call with camera and mic disabled by default
    streamCall
      .join({
        create: true,
        video: false,
      })
      .then(async () => {
        // Force tắt camera và mic sau khi join
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

    // Cleanup function
    return () => {
      if (streamCall) {
        streamCall.leave();
      }
    };
  }, [token, callId, apiKey]);

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
          <MyUILayout />
        </StreamCall>
      )}
    </StreamVideo>
  );
}

const MyUILayout = () => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const handleEndCall = async () => {
    if (call) {
      try {
        await call.endCall();
      } catch (error) {
        console.error("Failed to end call:", error);
      }
    }
  };

  const handleLeaveCall = async () => {
    if (call) {
      try {
        await call.leave();
      } catch (error) {
        console.error("Failed to leave call:", error);
      }
    }
  };

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
        <CallControls />
        <button
          onClick={handleLeaveCall}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Leave Call
        </button>
        <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          End Call
        </button>
      </div>
    </StreamTheme>
  );
};
