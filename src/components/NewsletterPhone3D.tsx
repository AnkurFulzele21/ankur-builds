"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Generates a crisp retina CanvasTexture of a live SaaS Vibes iOS Mail newsletter issue
 * mapped directly onto the iPhone 16 Pro OLED screen (`Object_3` at z = +0.39).
 */
function createNewsletterScreenTexture(): THREE.CanvasTexture {
  const W = 920;
  const H = 1984;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  // Pure white iOS Mail background
  roundRect(0, 0, W, H, 110, "#FFFFFF");

  // Status Bar
  ctx.fillStyle = "#0E1B2A";
  ctx.font = "700 34px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("9:14", 72, 92);
  ctx.textAlign = "right";
  ctx.fillText("5G  100%", W - 72, 92);
  ctx.textAlign = "left";

  // Dynamic Island
  roundRect(W / 2 - 135, 52, 270, 62, 31, "#0B121C");
  ctx.beginPath();
  ctx.arc(W / 2 + 82, 83, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#1E3A5F";
  ctx.fill();

  // < Inbox back link
  ctx.fillStyle = "#F04E18";
  ctx.font = "600 34px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("<  Inbox", 56, 195);

  // Email Subject
  ctx.fillStyle = "#0E1B2A";
  ctx.font = "800 46px 'Space Grotesk', -apple-system, sans-serif";
  ctx.fillText("How I shipped a micro-SaaS", 56, 268);
  ctx.fillText("in 72 hours", 56, 322);

  // Sender Avatar + Meta
  ctx.beginPath();
  ctx.arc(92, 396, 36, 0, Math.PI * 2);
  ctx.fillStyle = "#0E1B2A";
  ctx.fill();
  ctx.fillStyle = "#F8EAE0";
  ctx.font = "800 26px monospace";
  ctx.textAlign = "center";
  ctx.fillText("AF", 92, 405);
  ctx.textAlign = "left";

  ctx.fillStyle = "#0E1B2A";
  ctx.font = "700 30px -apple-system, sans-serif";
  ctx.fillText("Ankur Fulzele", 148, 388);
  ctx.fillStyle = "rgba(14, 27, 42, 0.55)";
  ctx.font = "500 26px -apple-system, sans-serif";
  ctx.fillText("to me · saasvibes@ankurfulzele.in", 148, 424);
  ctx.textAlign = "right";
  ctx.fillText("Sun 9:00 PM", W - 56, 394);
  ctx.textAlign = "left";

  // Divider
  ctx.fillStyle = "rgba(14, 27, 42, 0.12)";
  ctx.fillRect(56, 462, W - 112, 3);

  // SAAS VIBES Masthead inside email
  roundRect(W / 2 - 145, 502, 290, 56, 28, "#F8EAE0");
  ctx.fillStyle = "#0E1B2A";
  ctx.font = "800 28px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("●  SAAS VIBES", W / 2, 540);
  ctx.textAlign = "left";

  // Issue Title
  ctx.fillStyle = "#0E1B2A";
  ctx.font = "800 50px 'Space Grotesk', sans-serif";
  ctx.fillText("Vibe-Coding vs.", 56, 636);
  ctx.fillText("Over-Engineering", 56, 694);

  ctx.fillStyle = "rgba(14, 27, 42, 0.65)";
  ctx.font = "500 32px -apple-system, sans-serif";
  ctx.fillText("The two games indie builders play (and", 56, 750);
  ctx.fillText("why shipping beats perfection).", 56, 792);

  // Vibrant Signal Orange Hero Graphic Card
  roundRect(56, 845, W - 112, 340, 40, "#F04E18");
  // Subtle concentric rings on right of orange card
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 5;
  [65, 115, 165].forEach((r) => {
    ctx.beginPath();
    ctx.arc(W - 195, 1015, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(W - 195, 1015, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#F4A938";
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 52px 'Space Grotesk', sans-serif";
  ctx.fillText("Vibe-Coding", 104, 965);
  ctx.fillText("Playbook #04", 104, 1028);

  roundRect(104, 1068, 290, 52, 26, "#0E1B2A");
  ctx.fillStyle = "#F8EAE0";
  ctx.font = "700 22px monospace";
  ctx.fillText("BY ANKUR FULZELE", 136, 1102);

  // Email Body Copy
  const lines = [
    "Most solo builders spend 3 months",
    "perfecting auth before talking to a",
    "single paying customer.",
    "",
    "Last weekend I flipped the script:",
    "one tight prompt, Next.js 16 +",
    "Supabase + AI agents, and shipped",
    "live by Sunday night.",
    "",
    "Here is the exact stack, schema,",
    "and prompt chain you can steal",
    "for your next launch...",
  ];
  ctx.font = "500 34px -apple-system, sans-serif";
  let y = 1265;
  lines.forEach((line, idx) => {
    ctx.fillStyle = idx > 8 ? "rgba(14, 27, 42, 0.45)" : "rgba(14, 27, 42, 0.85)";
    if (line) ctx.fillText(line, 56, y);
    y += line ? 52 : 26;
  });

  // Home Indicator Bar
  roundRect(W / 2 - 140, H - 54, 280, 14, 7, "rgba(14, 27, 42, 0.25)");

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function IPhone16Model() {
  const { scene } = useGLTF("/models/iphone_16.glb");
  const groupRef = useRef<THREE.Group>(null);

  const screenTexture = useMemo(() => createNewsletterScreenTexture(), []);

  useEffect(() => {
    return () => {
      screenTexture.dispose();
    };
  }, [screenTexture]);

  const { normalizedScene, screenScale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 4.25 / maxDim;

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return { normalizedScene: clone, screenScale: scale };
  }, [scene]);

  // Gentle mouse-reactive 3D tilt (left-facing Creator Science angle at rest!)
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetRotY = -0.26 + state.pointer.x * 0.28;
    const targetRotX = 0.06 - state.pointer.y * 0.16;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      Math.min(1, delta * 5)
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      Math.min(1, delta * 5)
    );
  });

  // Rounded-rectangle screen geometry matching exact Object_3 OLED bounds (6.527 x 14.085 at z = 0.39)
  const screenGeo = useMemo(() => {
    const w = 6.46 * screenScale;
    const h = 14.0 * screenScale;
    const r = 0.72 * screenScale;
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const geo = new THREE.ShapeGeometry(shape, 16);
    // Normalize UVs cleanly to [0..1]
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = (pos.getX(i) - x) / w;
      uvs[i * 2 + 1] = (pos.getY(i) - y) / h;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [screenScale]);

  return (
    <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.22}>
      {/* Left-angled tilt matching Creator Science screenshot (tilted slightly left & drag-rotatable in 3D!) */}
      <group ref={groupRef} rotation={[0.06, -0.26, -0.045]}>
        <primitive object={normalizedScene} />

        {/* Flush OLED Screen Plane with Live Retina SaaS Vibes Newsletter Texture */}
        <mesh geometry={screenGeo} position={[0, 0, 0.415 * screenScale]}>
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

useGLTF.preload("/models/iphone_16.glb");

export function NewsletterPhone3D() {
  return (
    <div className="relative h-[470px] w-full max-w-[380px] sm:h-[535px] sm:max-w-[430px]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <hemisphereLight args={["#FFF9F2", "#1B3344", 1.5]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 8, 6]} intensity={2.2} color="#FFFFFF" />
        <directionalLight position={[-6, 4, 5]} intensity={1.2} color="#F4A938" />
        <pointLight position={[0, -3, 5]} intensity={0.8} color="#F04E18" />

        <Suspense fallback={null}>
          <IPhone16Model />
        </Suspense>

        {/* Drag to rotate the 3D iPhone 16 freely (zoom & pan disabled so page scroll stays smooth!) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>

      <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#0E1B2A]/15 bg-white/80 px-3 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#0E1B2A]/70 backdrop-blur-sm">
        Drag to spin 3D iPhone
      </p>
    </div>
  );
}
