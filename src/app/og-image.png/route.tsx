import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

/** 1200×630 social share image: cloud and ice, sky-blue headline, sun-gold accent and the SVG brand mark. */
export async function GET() {
  const mark = await readFile(path.join(process.cwd(), "public/brand/ts-mark.svg"));
  const markSrc = `data:image/svg+xml;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #F7FAFD 0%, #E3EEF9 60%, #FFF4D9 100%)", fontFamily: "Georgia, serif", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "linear-gradient(90deg, #F0BE4A, #F7D274)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 760 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#2B6CB0" }}>SOLAR ACROSS TELANGANA</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 72, color: "#14263A", lineHeight: 1.08, marginTop: 20 }}>
            <span>Make Your Own Power.&nbsp;</span><span style={{ color: "#2B6CB0" }}>Pay Less For It.</span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#44576B", marginTop: 26, fontFamily: "sans-serif" }}>Homes · Farms · Businesses · All 33 districts</div>
        </div>
        <div style={{ position: "absolute", right: 70, top: 120, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={300} height={300} alt="" style={{ borderRadius: 48, boxShadow: "0 30px 60px -30px rgba(27,69,112,0.28)" }} />
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, letterSpacing: 3 }}>
            <span style={{ color: "#1B4570" }}>TELANGANA&nbsp;</span><span style={{ color: "#D9A02E" }}>SOLAR</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
