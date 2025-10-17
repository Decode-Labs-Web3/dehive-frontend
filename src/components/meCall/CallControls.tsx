"use client";

interface CallControlsProps {
  onHangup: () => void;
  onToggleMic: (on: boolean) => void;
  onToggleCam: (on: boolean) => void;
  micOn: boolean;
  camOn: boolean;
  disabled?: boolean;
}

export default function CallControls({
  onHangup,
  onToggleMic,
  onToggleCam,
  micOn,
  camOn,
  disabled = false,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Microphone Toggle */}
      <button
        onClick={() => onToggleMic(!micOn)}
        disabled={disabled}
        className={`
          p-4 rounded-full transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
          ${micOn ? "bg-gray-700 text-white" : "bg-red-600 text-white"}
        `}
        title={micOn ? "Mute Microphone" : "Unmute Microphone"}
      >
        {micOn ? (
          // Microphone ON
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          // Microphone MUTED with slash
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={() => onToggleCam(!camOn)}
        disabled={disabled}
        className={`
          p-4 rounded-full transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
          ${camOn ? "bg-gray-700 text-white" : "bg-red-600 text-white"}
        `}
        title={camOn ? "Turn Off Camera" : "Turn On Camera"}
      >
        {camOn ? (
          // Camera ON
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        ) : (
          // Camera OFF with slash
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
            <line
              x1="4"
              y1="4"
              x2="20"
              y2="20"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* Hangup Button */}
      <button
        onClick={onHangup}
        disabled={disabled}
        className={`
          p-4 rounded-full bg-red-600 text-white transition-all
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-110 hover:bg-red-700"
          }
        `}
        title="End Call"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      </button>
    </div>
  );
}
