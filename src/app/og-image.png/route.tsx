import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

/** 1200×630 social share image in the brand colours, with the supplied logo. */
export async function GET() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/logo-original.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "radial-gradient(circle at 80% 20%, #1A2B57 0%, #07173F 60%)", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 560, height: 560, borderRadius: 999, background: "radial-gradient(circle, rgba(255,199,44,0.45) 0%, rgba(245,168,0,0.12) 45%, rgba(245,168,0,0) 70%)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", width: 700 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#FFC72C", letterSpacing: 2 }}>SOLAR ACROSS TELANGANA</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 70, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.05, marginTop: 18 }}>
            <span>Make Your&nbsp;</span><span style={{ color: "#FFC72C" }}>Own Power.</span><span>&nbsp;Pay Less For It.</span>
          </div>
          <div style={{ fontSize: 28, color: "#E6EAF0", marginTop: 24 }}>Homes · Farms · Businesses · All 33 districts</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={470} height={313} alt="" style={{ position: "absolute", right: 30, top: 160, borderRadius: 24 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
