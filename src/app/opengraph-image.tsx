import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dehive";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const title = "DeHive";
  const description =
    "Secure Web3 messaging with identity, channels, voice, and on‑chain features";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#0B0B0F",
          color: "#E5E7EB",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "#111827",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #1F2937",
            }}
          >
            <span style={{ fontSize: 48 }}>💬</span>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#F9FAFB" }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#D1D5DB", maxWidth: 920 }}>
          {description}
        </div>
        <div style={{ marginTop: 28, fontSize: 24, color: "#9CA3AF" }}>
          dehive.decodenetwork.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
