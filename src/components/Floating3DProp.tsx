"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function SpinningGlb({
  url,
  targetSize = 2.6,
  baseRotation = [0.2, 0.3, -0.08],
}: {
  url: string;
  targetSize?: number;
  baseRotation?: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetSize / maxDim;
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return clone;
  }, [scene, targetSize]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetY = baseRotation[1] + state.pointer.x * 0.55 + state.clock.elapsedTime * 0.28;
    const targetX = baseRotation[0] - state.pointer.y * 0.32;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      Math.min(1, delta * 4)
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      Math.min(1, delta * 4)
    );
  });

  return (
    <Float speed={1.8} rotationIntensity={0.22} floatIntensity={0.45}>
      <group ref={groupRef} rotation={baseRotation}>
        <primitive object={normalizedScene} />
      </group>
    </Float>
  );
}

export function Floating3DProp({
  url,
  targetSize = 2.6,
  baseRotation = [0.2, 0.3, -0.08],
}: {
  url: string;
  targetSize?: number;
  baseRotation?: [number, number, number];
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.2], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="h-full w-full"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} color="#FFF4E6" />
      <directionalLight position={[-4, -2, 3]} intensity={1.1} color="#F04E18" />
      <pointLight position={[0, 2, 3]} intensity={1.4} color="#F4A938" />
      <Suspense fallback={null}>
        <SpinningGlb url={url} targetSize={targetSize} baseRotation={baseRotation} />
      </Suspense>
    </Canvas>
  );
}
