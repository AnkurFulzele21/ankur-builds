"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface PropSpec {
  id: string;
  url: string;
  label: string;
  href: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetSize: number;
  floatSpeed: number;
  pillPosClass: string;
}

// Arc positioned directly along the top rim of the aspect-locked head box so all 5 3D objects
// sit tightly nestled in the torn-paper forehead across every phone, tablet & desktop screen!
const BRAIN_PROPS: PropSpec[] = [
  {
    id: "brain",
    url: "/models/human_brain.glb",
    label: "About Me",
    href: "/about",
    position: [-1.16, 0.52, -0.15],
    rotation: [0.16, 0.45, 0.12],
    targetSize: 1.22,
    floatSpeed: 1.4,
    pillPosClass: "left-[24%] top-[18%]",
  },
  {
    id: "coffee",
    url: "/models/coffee_shop_cup.glb",
    label: "Vibe Fuel",
    href: "/vibe-fuel",
    position: [-0.56, 0.82, 0.18],
    rotation: [0.16, 0.35, -0.16],
    targetSize: 1.32,
    floatSpeed: 1.7,
    pillPosClass: "left-[37%] top-[10%]",
  },
  {
    id: "laptop",
    url: "/models/macbook_laptop.glb",
    label: "Vibe Labs",
    href: "/vibe-labs",
    position: [0.05, 0.9, 0.05],
    rotation: [0.22, -0.18, 0.03],
    targetSize: 1.64,
    floatSpeed: 1.3,
    pillPosClass: "left-[50%] top-[8%]",
  },
  {
    id: "newspaper",
    url: "/models/newspaper.glb",
    label: "Newsletter",
    href: "/newsletter",
    position: [0.66, 0.78, -0.06],
    rotation: [1.42, -0.22, 0.14],
    targetSize: 1.4,
    floatSpeed: 1.6,
    pillPosClass: "left-[63%] top-[10%]",
  },
  {
    id: "dumbbell",
    url: "/models/dumbell_low-poly.glb",
    label: "Daily Grind",
    href: "/daily-grind",
    position: [1.28, 0.58, 0.34],
    rotation: [0.18, -0.35, 1.38],
    targetSize: 1.3,
    floatSpeed: 1.8,
    pillPosClass: "left-[76%] top-[18%]",
  },
];

function NormalizedGlbProp({
  prop,
  onHoverChange,
  onNavigate,
}: {
  prop: PropSpec;
  onHoverChange: (prop: PropSpec | null) => void;
  onNavigate: (href: string) => void;
}) {
  const { scene } = useGLTF(prop.url);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = prop.targetSize / maxDim;

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return clone;
  }, [scene, prop.targetSize]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetScale = hovered ? 1.08 : 1;
    const targetY = hovered ? prop.position[1] + 0.12 : prop.position[1];

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      Math.min(1, delta * 9)
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      Math.min(1, delta * 9)
    );

    const targetRotY = hovered ? prop.rotation[1] + state.pointer.x * 0.55 : prop.rotation[1];
    const targetRotX = hovered ? prop.rotation[0] - state.pointer.y * 0.32 : prop.rotation[0];

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      Math.min(1, delta * 7)
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      Math.min(1, delta * 7)
    );
  });

  return (
    <Float speed={prop.floatSpeed} rotationIntensity={0.08} floatIntensity={0.14}>
      <group
        ref={groupRef}
        position={prop.position}
        rotation={prop.rotation}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHoverChange(prop);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHoverChange(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHoverChange(null);
          document.body.style.cursor = "auto";
          onNavigate(prop.href);
        }}
      >
        <primitive object={normalizedScene} />
      </group>
    </Float>
  );
}

BRAIN_PROPS.forEach((p) => useGLTF.preload(p.url));

/**
 * Aspect-Locked 3D Brain Models Canvas:
 * - Mounted inside the exact same aspect-ratio bounding box as Ankur's torn-head portrait
 *   so the 5 3D objects NEVER separate or drift away from the forehead on phone, tablet, or desktop!
 */
export function BrainModelsCanvas() {
  const router = useRouter();
  const [activeProp, setActiveProp] = useState<PropSpec | null>(null);

  function handleNavigate(href: string) {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  }

  return (
    <div className="relative h-full w-full">
      {activeProp && (
        <div
          className={`pointer-events-none absolute z-50 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#0E1B2A] bg-white px-3.5 py-1.5 font-display text-[12px] font-bold tracking-tight text-[#0E1B2A] shadow-[0_14px_32px_rgba(0,0,0,0.45)] transition-all duration-150 sm:px-5 sm:py-2 sm:text-[15px] ${activeProp.pillPosClass}`}
        >
          {activeProp.label} →
        </div>
      )}

      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, -0.05, 4.8],
          fov: 40,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <hemisphereLight args={["#FFF8EC", "#1B3344", 1.35]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 6]} intensity={2.1} color="#FFF9F0" />
        <directionalLight position={[-5, 4, 4]} intensity={1.1} color="#F4A938" />
        <pointLight position={[0, -2, 5]} intensity={0.9} color="#F04E18" />

        {BRAIN_PROPS.map((prop) => (
          <Suspense key={prop.id} fallback={null}>
            <NormalizedGlbProp
              prop={prop}
              onHoverChange={setActiveProp}
              onNavigate={handleNavigate}
            />
          </Suspense>
        ))}
      </Canvas>
    </div>
  );
}
