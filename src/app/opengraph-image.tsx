import { ImageResponse } from "next/og";

export const alt = "CvSUFound — Lost & Found for the CvSU community";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f4d2a 0%, #0b3d1e 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 650,
            height: 650,
            right: -100,
            top: -10,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(31,122,63,.55) 0%, rgba(31,122,63,0) 70%)",
          }}
        />
        <svg style={{ position: "absolute", left: 0, bottom: 0, width: 1200, height: 130 }} viewBox="0 0 1200 130" preserveAspectRatio="none">
          <path d="M0 70 C280 7 392 189 720 88 S1030 41 1200 84 V130 H0Z" fill="#14612f" fillOpacity=".55" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", position: "absolute", left: 92, top: 78 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              border: "2px solid rgba(242,193,78,.45)",
              background: "#14612f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f2c14e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <div style={{ display: "flex", marginLeft: 21, color: "#ffffff", fontSize: 38, fontWeight: 800, letterSpacing: -1.6 }}>
            CvSU<span style={{ color: "#f2c14e" }}>Found</span>
          </div>
        </div>

        <div style={{ position: "absolute", left: 92, top: 268, display: "flex", color: "#f2c14e", fontSize: 17, fontWeight: 700, letterSpacing: 3 }}>
          LOST &amp; FOUND
        </div>
        <div style={{ position: "absolute", left: 92, top: 305, display: "flex", flexDirection: "column", color: "#ffffff", fontSize: 54, fontWeight: 800, lineHeight: 1.18, letterSpacing: -1.5 }}>
          <span>Lost something</span>
          <span>on campus?</span>
        </div>
        <div style={{ position: "absolute", left: 92, top: 431, display: "flex", color: "#f2c14e", fontSize: 46, fontWeight: 800, letterSpacing: -1.3 }}>
          Let&apos;s find it.
        </div>
        <div style={{ position: "absolute", left: 94, top: 512, display: "flex", color: "#cfe5d3", fontSize: 21 }}>
          Report it, find it, claim it.
        </div>

        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            right: 140,
            top: 165,
            borderRadius: "50%",
            background: "rgba(20,97,47,.65)",
            border: "2px solid rgba(242,193,78,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 216,
              height: 216,
              borderRadius: "50%",
              border: "18px solid rgba(207,229,211,.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 142, height: 142, borderRadius: "50%", background: "rgba(15,77,42,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="86" height="86" viewBox="0 0 80 80" fill="none">
                <path d="M12 40 30 58 68 18" stroke="#f2c14e" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", width: 110, height: 25, borderRadius: 13, background: "#f2c14e", right: -72, bottom: 28, transform: "rotate(45deg)" }} />
        </div>

        <div
          style={{
            position: "absolute",
            right: 184,
            bottom: 78,
            width: 212,
            height: 42,
            borderRadius: 21,
            border: "1px solid rgba(197,214,193,.45)",
            background: "#0b3d1e",
            color: "#cfe5d3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          CvSU COMMUNITY
        </div>
        <div style={{ position: "absolute", left: 92, bottom: 35, width: 1016, height: 2, borderRadius: 1, background: "rgba(242,193,78,.5)" }} />
      </div>
    ),
    size,
  );
}
