import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée automatiquement (Facebook, WhatsApp, LinkedIn…). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14110f",
          color: "#faf8f5",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#2b2622", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", fontSize: 44, fontWeight: 900 }}>
            E
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Le bon bien.</div>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3, color: "#ea580c" }}>Au juste prix.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#b3aaa0" }}>
          <span>Achat · Vente · Location · Gestion</span>
          <span>Douala · Yaoundé · Kribi</span>
        </div>
      </div>
    ),
    size,
  );
}
