/**
 * Stylised Hyderabad-at-sunrise skyline (coded placeholder for the 3D hero render).
 * Navy silhouettes, gold-lit rooftop panels with a shimmer sweep.
 */
const PANELS: [number, number, number][] = [
  // x, y (roof top), width
  [70, 352, 70], [255, 300, 60], [430, 262, 56], [690, 318, 64], [905, 280, 70], [1110, 330, 76], [1330, 296, 62],
];

export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="sky-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3361" />
          <stop offset="1" stopColor="#102549" />
        </linearGradient>
        <linearGradient id="sky-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2247" />
          <stop offset="1" stopColor="#07122a" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a4678" />
          <stop offset="1" stopColor="#13284f" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFB800" stopOpacity="0" />
          <stop offset=".5" stopColor="#FFE08A" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFB800" stopOpacity="0" />
        </linearGradient>
        <clipPath id="panels-clip">
          {PANELS.map(([x, y, w], i) => (
            <path key={i} d={`M${x} ${y - 2} l10 -18 h${w - 20} l10 18 z`} />
          ))}
        </clipPath>
      </defs>

      {/* Far layer: hazy towers + minaret silhouette */}
      <g fill="url(#sky-far)" opacity=".85">
        <path d="M0 330h60v-60h40v-40h30v100h50V250h44v80h40v-120h26v120h60v-70h48v70h40V200l22-30 22 30v130h52v-90h40v90h70v-40h36v40h44V160h54v170h40v-80h50v80h60v-110h40v110h50V230h48v100h56v-60h40v60h46v-140h40v140h60v-70h44v70h64V520H0z" />
        {/* four-minaret monument silhouette */}
        <g transform="translate(560 168)">
          <rect x="0" y="40" width="120" height="122" />
          <path d="M8 40c0-34 104-34 104 0z" />
          {[0, 106].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect x="0" y="-30" width="14" height="192" />
              <circle cx="7" cy="-34" r="9" />
              <rect x="5.5" y="-52" width="3" height="10" />
            </g>
          ))}
          <path d="M34 162v-58a26 26 0 0 1 52 0v58z" fill="#0b1b3a" opacity=".5" />
        </g>
      </g>

      {/* Near layer: homes and apartment blocks with rooftops */}
      <g fill="url(#sky-near)">
        <path d="M0 520V360h50v-8h100v8h40V330h20v-30h80v30h20v190z" />
        <path d="M230 520V300h120v220z" />
        <path d="M400 520V262h130v258z" />
        <path d="M560 520V380h90v140z" />
        <path d="M660 520V318h140v202z" />
        <path d="M840 520V360h40v-80h120v240z" />
        <path d="M1040 520V400h50v-70h140v190z" />
        <path d="M1280 520V296h120v224z" />
        <path d="M1400 520V380h40v140z" />
      </g>

      {/* Lit windows */}
      <g fill="#FFB800" opacity=".55">
        {[[250, 330], [290, 330], [250, 370], [430, 300], [470, 300], [430, 350], [690, 360], [730, 360], [910, 320], [950, 360], [1310, 330], [1350, 380], [1120, 370]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="14" height="18" rx="2" className={i % 3 === 0 ? "animate-pulse" : undefined} />
        ))}
      </g>

      {/* Rooftop solar panels */}
      <g>
        {PANELS.map(([x, y, w], i) => (
          <g key={i}>
            <path d={`M${x} ${y - 2} l10 -18 h${w - 20} l10 18 z`} fill="url(#panel)" stroke="#6a7fa6" strokeWidth="1" />
            {Array.from({ length: Math.floor(w / 14) }).map((_, j) => (
              <path key={j} d={`M${x + 8 + j * 14} ${y - 2} l5 -18`} stroke="#6a7fa6" strokeWidth=".6" opacity=".7" />
            ))}
            <path d={`M${x + 5} ${y - 11} h${w - 10}`} stroke="#6a7fa6" strokeWidth=".6" opacity=".7" />
          </g>
        ))}
        <g clipPath="url(#panels-clip)">
          <rect x="-200" y="200" width="200" height="200" fill="url(#shine)" className="hero-panel-shine" />
        </g>
      </g>
      <style>{`
        .hero-panel-shine { animation: panelShine 5s cubic-bezier(.22,1,.36,1) infinite 1.6s; }
        @keyframes panelShine { 0% { transform: translateX(0) } 70%,100% { transform: translateX(1840px) } }
        @media (prefers-reduced-motion: reduce) { .hero-panel-shine { animation: none } }
      `}</style>
    </svg>
  );
}
