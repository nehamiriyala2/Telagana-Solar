"use client";
import { motion, useTransform, type MotionValue } from "framer-motion";

/**
 * Coded "how solar works" diagram, driven by a 0..1 progress MotionValue.
 * Stages: 0 sun, 1 panels (DC), 2 inverter (AC), 3 net meter, 4 home, 5 grid.
 * Energy flows along wires as glowing dashes once each stage is reached.
 */
export const STAGES = ["sun", "panels", "inverter", "meter", "home", "grid"] as const;
export const stageAt = (p: number) => Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));

const WIRES = [
  { id: "dc", d: "M520 196 C 600 196 640 230 660 300", from: 1 },
  { id: "ac", d: "M700 330 C 740 330 750 330 780 330", from: 2 },
  { id: "home", d: "M800 360 C 800 420 640 430 560 420", from: 4 },
  { id: "grid", d: "M830 320 C 870 260 880 220 905 200", from: 5 },
];

function useStage(p: MotionValue<number>, i: number) {
  const start = i / STAGES.length;
  return {
    opacity: useTransform(p, [start - 0.06, start + 0.04], [0.25, 1]),
    glow: useTransform(p, [start - 0.02, start + 0.06, start + 0.16], [0, 1, 0.35]),
  };
}

export function EnergyDiagram({ progress, className }: { progress: MotionValue<number>; className?: string }) {
  const s = STAGES.map((_, i) => useStage(progress, i)); // eslint-disable-line react-hooks/rules-of-hooks
  const rayLen = useTransform(progress, [0, 0.16], [0, 1]);
  const sunY = useTransform(progress, [0, 0.16], [40, 0]);
  const wireP = WIRES.map((w) => useTransform(progress, [w.from / 6, w.from / 6 + 0.1], [0, 1])); // eslint-disable-line react-hooks/rules-of-hooks
  const homeLight = useTransform(progress, [4 / 6, 4 / 6 + 0.08], [0, 1]);

  return (
    <svg viewBox="0 0 1000 560" className={className} role="img" aria-label="Sun → panels → inverter → net meter → home → grid">
      <defs>
        <radialGradient id="ed-sun"><stop offset="0" stopColor="#FFE7A3" /><stop offset=".5" stopColor="#FFB800" /><stop offset="1" stopColor="#FF8A00" /></radialGradient>
        <radialGradient id="ed-glow"><stop offset="0" stopColor="#FFB800" stopOpacity=".55" /><stop offset="1" stopColor="#FFB800" stopOpacity="0" /></radialGradient>
        <linearGradient id="ed-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a4678" /><stop offset="1" stopColor="#102549" /></linearGradient>
        <filter id="ed-blur"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      {/* ground */}
      <path d="M0 480 H1000" className="stroke-fg/15" strokeWidth="2" />

      {/* 0 · Sun */}
      <motion.g style={{ opacity: s[0].opacity, y: sunY }}>
        <motion.circle cx="140" cy="110" r="110" fill="url(#ed-glow)" style={{ opacity: s[0].glow }} />
        <circle cx="140" cy="110" r="48" fill="url(#ed-sun)" />
      </motion.g>
      {/* rays to panels */}
      {[[180, 140, 360, 200], [175, 160, 400, 215], [165, 175, 440, 225]].map(([x1, y1, x2, y2], i) => (
        <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFB800" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" style={{ pathLength: rayLen, opacity: rayLen }} />
      ))}

      {/* 4 · House */}
      <motion.g style={{ opacity: s[4].opacity }}>
        <path d="M330 300 L460 190 L590 300 V480 H330 Z" className="fill-surface stroke-fg/20" strokeWidth="2" />
        <motion.rect x="350" y="330" width="220" height="130" rx="6" fill="#FFB800" style={{ opacity: useTransform(homeLight, [0, 1], [0, 0.18]) }} />
        {/* appliances: bulb, fan, tv */}
        <g className="stroke-fg/70" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M395 335 v12" /><motion.circle cx="395" cy="358" r="11" fill="#FFB800" style={{ opacity: homeLight }} /><circle cx="395" cy="358" r="11" />
          <circle cx="460" cy="345" r="4" /><path d="M460 345 l-26 -6 M460 345 l26 -6 M460 345 l0 22" />
          <rect x="495" y="395" width="56" height="36" rx="4" /><motion.rect x="499" y="399" width="48" height="28" rx="2" fill="#FFB800" stroke="none" style={{ opacity: homeLight }} />
        </g>
      </motion.g>

      {/* 1 · Panels on roof */}
      <motion.g style={{ opacity: s[1].opacity }}>
        <motion.path d="M372 228 L450 162 L540 168 L470 236 Z" fill="#FFB800" filter="url(#ed-blur)" style={{ opacity: s[1].glow }} />
        <path d="M372 228 L450 162 L540 168 L470 236 Z" fill="url(#ed-panel)" stroke="#6a7fa6" strokeWidth="1.5" />
        {[0.25, 0.5, 0.75].map((f) => (
          <path key={f} d={`M${372 + (450 - 372) * f} ${228 + (162 - 228) * f} L${470 + (540 - 470) * f} ${236 + (168 - 236) * f}`} stroke="#6a7fa6" strokeWidth="1" />
        ))}
        <path d="M405 232 L485 165 M440 234 L515 167" stroke="#6a7fa6" strokeWidth="1" />
        <text x="440" y="150" textAnchor="middle" className="fill-fg font-heading text-[18px] font-bold">DC</text>
      </motion.g>

      {/* 2 · Inverter */}
      <motion.g style={{ opacity: s[2].opacity }}>
        <motion.rect x="630" y="290" width="76" height="84" rx="12" fill="#FFB800" filter="url(#ed-blur)" style={{ opacity: s[2].glow }} />
        <rect x="630" y="290" width="76" height="84" rx="12" className="fill-navy dark:fill-navy-700" />
        <path d="M648 318 q8 -12 16 0 t16 0" stroke="#FFB800" strokeWidth="3" fill="none" />
        <rect x="648" y="340" width="40" height="6" rx="3" fill="#2FBF71" />
        <text x="668" y="400" textAnchor="middle" className="fill-fg font-heading text-[18px] font-bold">AC</text>
      </motion.g>

      {/* 3 · Net meter */}
      <motion.g style={{ opacity: s[3].opacity }}>
        <motion.circle cx="805" cy="330" r="44" fill="#FFB800" filter="url(#ed-blur)" style={{ opacity: s[3].glow }} />
        <rect x="770" y="296" width="70" height="70" rx="14" className="fill-surface stroke-fg/30" strokeWidth="2" />
        <rect x="782" y="312" width="46" height="18" rx="3" className="fill-navy dark:fill-navy-700" />
        <text x="805" y="326" textAnchor="middle" fill="#FFB800" className="font-heading text-[12px] font-bold">⇄ 0482</text>
      </motion.g>

      {/* 5 · Grid tower */}
      <motion.g style={{ opacity: s[5].opacity }} className="stroke-fg/70" strokeWidth="3" fill="none" strokeLinejoin="round">
        <motion.circle cx="930" cy="250" r="70" fill="#FFB800" stroke="none" filter="url(#ed-blur)" style={{ opacity: useTransform(s[5].glow, [0, 1], [0, 0.4]) }} />
        <path d="M905 480 L930 180 L955 480 M912 400 H948 M918 320 H942 M890 230 H970 M896 270 H964 M912 400 L942 320 M948 400 L918 320" />
      </motion.g>

      {/* Wires + flowing energy */}
      {WIRES.map((w, i) => (
        <g key={w.id}>
          <path d={w.d} className="stroke-fg/15" strokeWidth="4" fill="none" strokeLinecap="round" />
          <motion.path d={w.d} stroke="#FFB800" strokeWidth="4" fill="none" strokeLinecap="round" style={{ pathLength: wireP[i] }} />
          <motion.path d={w.d} stroke="#FFF1C2" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 14" className="animate-flow" style={{ opacity: wireP[i] }} />
        </g>
      ))}
    </svg>
  );
}
