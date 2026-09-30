import { ImageResponse } from "next/og";

export const alt = "devolio — Taiyo Williamson's terminal-style developer portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#0e1116",
          color: "#e6edf3",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, color: "#8b949e" }}>
          <span style={{ color: "#7ee787" }}>~</span>
          <span>&nbsp;$ whoami</span>
        </div>
        <div style={{ display: "flex", fontSize: 88, marginTop: 24 }}>
          Taiyo Williamson
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#8b949e", marginTop: 16 }}>
          software engineer · systems, infrastructure, AI
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#7ee787", marginTop: 64 }}>
          taiyyoson.com
        </div>
      </div>
    ),
    size,
  );
}
