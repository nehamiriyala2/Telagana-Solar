"use client";
/**
 * Hero 3D scene (React Three Fiber). Rounded low-poly shapes, soft bright light, glossy panels.
 * - Sun beams hit the roof, panels glow, golden particles flow roof → meter → house
 * - Gold ring like the logo, small golden Charminar behind the house
 * - Mouse parallax + drag to rotate (desktop), gentle auto-sway (touch)
 * - Day / night: night dims the sun, windows glow
 * Loaded lazily by hero-visual.tsx; never rendered on the server.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#F5A800";
const YELLOW = "#FFC72C";
const ROYAL = "#1E5BD8";
const SKY = "#4DA3FF";

export interface SceneProps {
  night: boolean;
  /** Extra rotation from drag (radians), owned by the DOM wrapper */
  dragRef: React.MutableRefObject<number>;
  coarsePointer: boolean;
  visible: boolean;
  onReady?: () => void;
}

const lerp = THREE.MathUtils.lerp;

/* ---------- textures made in code (no downloads) ---------- */
function usePanelTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 256, 256);
    grd.addColorStop(0, "#2D6FE8");
    grd.addColorStop(1, "#0E3A9C");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(200,225,255,0.55)";
    g.lineWidth = 3;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo((i * 256) / 6, 0); g.lineTo((i * 256) / 6, 256); g.stroke(); }
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, (i * 256) / 4); g.lineTo(256, (i * 256) / 4); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 8;
    g.strokeRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,230,140,1)");
    grd.addColorStop(0.25, "rgba(255,199,44,0.65)");
    grd.addColorStop(0.6, "rgba(245,168,0,0.18)");
    grd.addColorStop(1, "rgba(245,168,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* ---------- pieces ---------- */
function Platform() {
  return (
    <group>
      <mesh position={[0, -0.32, 0]} receiveShadow>
        <cylinderGeometry args={[4.4, 4.1, 0.6, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <cylinderGeometry args={[4.25, 4.25, 0.06, 64]} />
        <meshStandardMaterial color="#A6DC8F" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.32, 0.045, 12, 96]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.35} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Path stones */}
      {[0, 1, 2, 3].map((i) => (
        <RoundedBox key={i} args={[0.5, 0.05, 0.32]} radius={0.06} position={[0, 0.05, 1.75 + i * 0.55]}>
          <meshStandardMaterial color="#F3EEE2" roughness={0.9} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Roof({ panelGlow }: { panelGlow: React.MutableRefObject<number> }) {
  const tex = usePanelTexture();
  const panelMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: tex, color: "#FFFFFF", metalness: 0.35, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: new THREE.Color(SKY), emissiveIntensity: 0.15 }), [tex]);
  const ang = 0.55;
  const half = 1.45;
  const rise = half * Math.tan(ang);
  const len = half / Math.cos(ang) + 0.08;

  const gable = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-half + 0.15, 0);
    s.lineTo(half - 0.15, 0);
    s.lineTo(0, rise - 0.05);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 3.1, bevelEnabled: false });
    geo.translate(0, 0, -1.55);
    return geo;
  }, [half, rise]);

  useFrame(() => {
    panelMat.emissiveIntensity = panelGlow.current;
  });

  const slope = (dir: 1 | -1, children?: React.ReactNode) => (
    <group position={[0, 2.0 + rise / 2, (dir * half) / 2]} rotation={[dir * ang, 0, 0]}>
      <RoundedBox args={[3.7, 0.12, len]} radius={0.05} castShadow receiveShadow>
        <meshStandardMaterial color="#DCE3EE" roughness={0.6} />
      </RoundedBox>
      {children}
    </group>
  );

  return (
    <group>
      {/* gable infill (rotated so the extrusion runs along x) */}
      <mesh geometry={gable} position={[0, 2.0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {slope(1, (
        <group position={[0, 0.09, 0]}>
          {[-1.2, -0.4, 0.4, 1.2].flatMap((x) => [-0.4, 0.4].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0, z]} material={panelMat} castShadow>
              <boxGeometry args={[0.74, 0.04, 0.72]} />
            </mesh>
          )))}
        </group>
      ))}
      {slope(-1)}
    </group>
  );
}

function House({ night }: { night: React.MutableRefObject<number> }) {
  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#CFE6FF", emissive: new THREE.Color(YELLOW), emissiveIntensity: 0.08, roughness: 0.15, metalness: 0.1 }), []);
  useFrame(() => {
    const n = night.current;
    windowMat.emissiveIntensity = lerp(0.08, 1.6, n);
    windowMat.color.set(n > 0.5 ? "#FFE7A0" : "#CFE6FF");
  });
  const win = (x: number, y: number, z: number, ry = 0) => (
    <group position={[x, y, z]} rotation={[0, ry, 0]}>
      <RoundedBox args={[0.66, 0.56, 0.06]} radius={0.03}>
        <meshStandardMaterial color="#FFFFFF" />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]} material={windowMat}>
        <planeGeometry args={[0.56, 0.46]} />
      </mesh>
      <mesh position={[0, 0, 0.04]}><boxGeometry args={[0.03, 0.46, 0.01]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
    </group>
  );
  return (
    <group>
      <RoundedBox args={[3.2, 1.95, 2.6]} radius={0.08} position={[0, 1.0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.75} />
      </RoundedBox>
      {/* base trim */}
      <RoundedBox args={[3.3, 0.14, 2.7]} radius={0.05} position={[0, 0.07, 0]}>
        <meshStandardMaterial color="#E6EAF0" />
      </RoundedBox>
      {win(-0.95, 1.2, 1.31)}
      {win(0.95, 1.2, 1.31)}
      {win(1.61, 1.25, -0.5, Math.PI / 2)}
      {/* door */}
      <RoundedBox args={[0.58, 0.98, 0.06]} radius={0.04} position={[0, 0.56, 1.31]}>
        <meshStandardMaterial color="#07173F" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0.18, 0.56, 1.35]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} /></mesh>
      {/* electric meter on the right wall */}
      <group position={[1.64, 0.95, 0.65]}>
        <RoundedBox args={[0.08, 0.46, 0.34]} radius={0.03}><meshStandardMaterial color="#E6EAF0" /></RoundedBox>
        <mesh position={[0.045, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 0.12]} />
          <meshBasicMaterial color="#3FA535" toneMapped={false} />
        </mesh>
      </group>
      {/* solar inverter box */}
      <RoundedBox args={[0.08, 0.36, 0.3]} radius={0.03} position={[1.64, 0.95, 0.15]}>
        <meshStandardMaterial color="#FFFFFF" />
      </RoundedBox>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.08, 0.11, 0.9, 10]} /><meshStandardMaterial color="#B88A5A" roughness={0.9} /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><icosahedronGeometry args={[0.62, 1]} /><meshStandardMaterial color="#5DBB4A" flatShading roughness={0.8} /></mesh>
      <mesh position={[0.25, 1.62, 0.1]} castShadow><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color="#6CC75A" flatShading roughness={0.8} /></mesh>
    </group>
  );
}

function Garden() {
  const bushes: [number, number, number, number][] = [[-1.7, 0.22, 1.55, 0.3], [-1.25, 0.18, 1.75, 0.22], [1.8, 0.22, 1.5, 0.3], [2.2, 0.17, 1.15, 0.2], [-2.0, 0.2, -1.3, 0.26]];
  return (
    <group>
      {bushes.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={i % 2 ? "#7ACB66" : "#4FAE3F"} flatShading /></mesh>
      ))}
      {/* small flowers */}
      {[[-1.5, 1.95], [-1.0, 2.05], [1.5, 1.95], [1.1, 2.1]].map(([x, z], i) => (
        <mesh key={`f${i}`} position={[x, 0.09, z]}><sphereGeometry args={[0.06, 10, 10]} /><meshStandardMaterial color={i % 2 ? YELLOW : "#FF8FA3"} /></mesh>
      ))}
    </group>
  );
}

function Charminar() {
  const mat = <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.18} metalness={0.55} roughness={0.35} />;
  return (
    <group position={[2.5, 0.03, -2.45]} rotation={[0, -0.3, 0]} scale={0.52}>
      <RoundedBox args={[2, 1.5, 2]} radius={0.05} position={[0, 0.75, 0]} castShadow>{mat}</RoundedBox>
      {/* arches (dark insets) */}
      {[[0, 1.01, 0], [1.01, 0, Math.PI / 2]].map(([x, z, r], i) => (
        <mesh key={i} position={[x as number, 0.62, z as number]} rotation={[0, r as number, 0]}>
          <planeGeometry args={[0.8, 1.0]} /><meshStandardMaterial color="#8A5A00" />
        </mesh>
      ))}
      <RoundedBox args={[2.15, 0.16, 2.15]} radius={0.04} position={[0, 1.58, 0]}>{mat}</RoundedBox>
      <RoundedBox args={[1.6, 0.5, 1.6]} radius={0.05} position={[0, 1.9, 0]}>{mat}</RoundedBox>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.65, 0]} castShadow><cylinderGeometry args={[0.15, 0.19, 3.3, 14]} />{mat}</mesh>
          <mesh position={[0, 2.4, 0]}><cylinderGeometry args={[0.24, 0.24, 0.1, 14]} />{mat}</mesh>
          <mesh position={[0, 3.42, 0]}><sphereGeometry args={[0.22, 16, 16]} />{mat}</mesh>
          <mesh position={[0, 3.75, 0]}><coneGeometry args={[0.05, 0.3, 8]} />{mat}</mesh>
        </group>
      ))}
    </group>
  );
}

function Sun({ night }: { night: React.MutableRefObject<number> }) {
  const glow = useGlowTexture();
  const group = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const n = night.current;
    if (group.current) group.current.quaternion.copy(camera.quaternion);
    if (rays.current) {
      rays.current.rotation.z = t * 0.12;
      const s = 1 + Math.sin(t * 1.6) * 0.06;
      rays.current.scale.setScalar(s * (1 - n * 0.6));
    }
    if (halo.current) {
      halo.current.material.opacity = (0.85 + Math.sin(t * 1.6) * 0.15) * (1 - n * 0.85);
      halo.current.scale.setScalar(4.2 + Math.sin(t * 1.6) * 0.3);
    }
    if (core.current) core.current.color.set(n > 0.5 ? "#F3E7C0" : YELLOW);
  });
  return (
    <group position={[2.7, 5.5, -4.6]}>
      <sprite ref={halo} scale={4.2} renderOrder={1}>
        <spriteMaterial map={glow} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <group ref={group}>
        <group ref={rays}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, -0.05]} rotation={[0, 0, a - Math.PI / 2]}>
                <planeGeometry args={[0.09, i % 2 ? 0.45 : 0.7]} />
                <meshBasicMaterial color={GOLD} transparent opacity={0.85} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
        <mesh renderOrder={2}>
          <circleGeometry args={[0.78, 48]} />
          <meshBasicMaterial ref={core} color={YELLOW} depthTest={false} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Beams({ night }: { night: React.MutableRefObject<number> }) {
  const sun = new THREE.Vector3(2.7, 5.5, -4.6);
  const targets = [new THREE.Vector3(-0.9, 2.5, 0.75), new THREE.Vector3(0.2, 2.6, 0.6), new THREE.Vector3(1.1, 2.45, 0.85)];
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mats.current.forEach((m, i) => { if (m) m.opacity = (0.09 + Math.sin(t * 1.4 + i) * 0.05) * (1 - night.current); });
  });
  return (
    <group>
      {targets.map((tgt, i) => {
        const dir = tgt.clone().sub(sun);
        const len = dir.length();
        const mid = sun.clone().add(dir.clone().multiplyScalar(0.5));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.16, 0.03, len, 16, 1, true]} />
            <meshBasicMaterial ref={(m) => { mats.current[i] = m; }} color={YELLOW} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Golden energy particles: roof → inverter → meter → into the house. */
function EnergyFlow({ night }: { night: React.MutableRefObject<number> }) {
  const N = 40;
  const ref = useRef<THREE.InstancedMesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 2.55, 0.95),
    new THREE.Vector3(1.35, 2.15, 1.25),
    new THREE.Vector3(1.78, 1.55, 0.6),
    new THREE.Vector3(1.72, 0.95, 0.15),
    new THREE.Vector3(1.72, 0.95, 0.65),
    new THREE.Vector3(1.55, 0.35, 1.2),
    new THREE.Vector3(0.6, 0.3, 1.55),
    new THREE.Vector3(0.05, 0.6, 1.4),
  ]), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const speed = lerp(0.12, 0.07, night.current);
    for (let i = 0; i < N; i++) {
      const u = (i / N + t * speed) % 1;
      curve.getPointAt(u, p);
      dummy.position.copy(p);
      const s = 0.6 + Math.sin(t * 6 + i) * 0.25 + (u < 0.1 ? u * 4 : 0);
      dummy.scale.setScalar(s * (u > 0.94 ? (1 - u) * 16 : 1));
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshBasicMaterial color={YELLOW} toneMapped={false} />
    </instancedMesh>
  );
}

function Clouds() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const clouds = [
    { y: 4.4, z: -3.5, speed: 0.22, offset: 0, s: 1 },
    { y: 5.6, z: -1.5, speed: 0.15, offset: 6, s: 0.75 },
    { y: 3.8, z: 1.5, speed: 0.18, offset: 11, s: 0.6 },
  ];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    clouds.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.x = ((((t * c.speed + c.offset) % 16) + 16) % 16) - 8;
      g.position.y = c.y + Math.sin(t * 0.5 + i) * 0.08;
    });
  });
  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={[0, c.y, c.z]} scale={c.s}>
          {[[0, 0, 0, 0.55], [0.55, 0.1, 0, 0.45], [-0.55, -0.05, 0, 0.42], [0.2, 0.32, 0.05, 0.4]].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]}><sphereGeometry args={[r, 18, 18]} /><meshStandardMaterial color="#FFFFFF" roughness={1} transparent opacity={0.95} /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Glowing gold ring behind the scene, always facing the viewer, like the ring in the logo. */
function GoldRing() {
  const face = useRef<THREE.Group>(null);
  const arc = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(({ clock }) => {
    if (face.current) face.current.quaternion.copy(camera.quaternion);
    if (arc.current) arc.current.rotation.z = 0.9 + Math.sin(clock.elapsedTime * 0.3) * 0.15;
  });
  return (
    <group position={[-0.2, 2.0, -2.6]}>
      <group ref={face}>
        <mesh ref={arc}>
          <torusGeometry args={[4.7, 0.035, 8, 180, Math.PI * 1.45]} />
          <meshBasicMaterial color={YELLOW} transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, 0.9]}>
          <torusGeometry args={[4.7, 0.16, 8, 180, Math.PI * 1.45]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Lights + global motion (parallax, drag, sway, float, day/night blend). */
function Rig({ night, dragRef, coarsePointer, children, onReady }: { night: boolean; dragRef: SceneProps["dragRef"]; coarsePointer: boolean; children: (n: React.MutableRefObject<number>, glow: React.MutableRefObject<number>) => React.ReactNode; onReady?: () => void }) {
  const group = useRef<THREE.Group>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sunLight = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const n = useRef(night ? 1 : 0);
  const glow = useRef(0.15);
  const ready = useRef(false);
  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    n.current = lerp(n.current, night ? 1 : 0, Math.min(1, delta * 2.5));
    const k = n.current;
    // Panels glow in pulses as the beams hit them (day only)
    glow.current = lerp(0.12, 0.55 + Math.sin(t * 1.6) * 0.2, 1 - k) * (1 - k) + 0.02;
    if (hemi.current) hemi.current.intensity = lerp(1.15, 0.35, k);
    if (sunLight.current) sunLight.current.intensity = lerp(2.4, 0.15, k);
    if (moon.current) moon.current.intensity = lerp(0, 0.8, k);
    if (group.current) {
      const targetY = coarsePointer ? Math.sin(t * 0.35) * 0.18 : pointer.x * 0.32;
      const targetX = coarsePointer ? Math.sin(t * 0.25) * 0.03 : -pointer.y * 0.06;
      group.current.rotation.y = lerp(group.current.rotation.y, -0.35 + targetY + dragRef.current, 0.06);
      group.current.rotation.x = lerp(group.current.rotation.x, targetX, 0.06);
      group.current.position.y = Math.sin(t * 0.8) * 0.06;
    }
    if (!ready.current) { ready.current = true; onReady?.(); }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#EAF4FF", "#FFF3D1", 1.15]} />
      <directionalLight ref={sunLight} position={[6, 9, 4]} intensity={2.4} color="#FFE9B8" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight ref={moon} position={[-5, 6, 4]} intensity={0} color="#9DB8FF" />
      <ambientLight intensity={0.25} />
      <group ref={group}>{children(n, glow)}</group>
    </>
  );
}

export default function HeroScene({ night, dragRef, coarsePointer, visible, onReady }: SceneProps) {
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.6]}
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [10.2, 7.4, 13.4], fov: 30, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0.3, 2.1, 0)}
      style={{ touchAction: "pan-y" }}
    >
      <Rig night={night} dragRef={dragRef} coarsePointer={coarsePointer} onReady={onReady}>
        {(n, glow) => (
          <>
            <Sun night={n} />
            <Beams night={n} />
            <GoldRing />
            <Clouds />
            <Platform />
            <Charminar />
            <House night={n} />
            <Roof panelGlow={glow} />
            <Tree position={[-3.0, 0.03, 1.5]} />
            <Tree position={[3.05, 0.03, 0.9]} scale={0.8} />
            <Garden />
            <EnergyFlow night={n} />
            <ContactShadows position={[0, 0.04, 0]} opacity={0.35} scale={9} blur={2.4} far={4} resolution={512} color="#07173F" />
          </>
        )}
      </Rig>
    </Canvas>
  );
}
