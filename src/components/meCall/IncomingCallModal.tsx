"use client";

interface IncomingCallModalProps {
  open: boolean;
  callerName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({
  open,
  callerName = "Unknown",
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-800">
        {/* Incoming call icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </div>
        </div>

        {/* Caller info */}
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          Incoming Call
        </h2>
        <p className="text-center text-gray-400 mb-8">
          <span className="font-medium text-white">{callerName}</span> is
          calling...
        </p>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:scale-105"
          >
            ✕ Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:scale-105"
          >
            ✓ Accept
          </button>
        </div>
      </div>
    </div>
  );
}
