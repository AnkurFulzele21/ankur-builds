"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

interface KeycapDef {
  id: string;
  label: string;
  sub: string;
  position: [number, number, number];
  color: string;
  textColor: string;
  targetSection: string;
}

const KEYCAPS: KeycapDef[] = [
  {
    id: "esc",
    label: "ESC",
    sub: "STORY",
    position: [-0.88, 0.36, -0.82],
    color: "#E85A2A",
    textColor: "#EFE9DC",
    targetSection: "origin",
  },
  {
    id: "ship",
    label: "SHIP",
    sub: "BUILDS",
    position: [0.88, 0.36, -0.82],
    color: "#F4A938",
    textColor: "#151E28",
    targetSection: "builds",
  },
  {
    id: "vibe",
    label: "VIBE",
    sub: "LAB",
    position: [-0.88, 0.36, 0.82],
    color: "#EFE9DC",
    textColor: "#151E28",
    targetSection: "lab",
  },
  {
    id: "read",
    label: "READ",
    sub: "ISSUES",
    position: [0.88, 0.36, 0.82],
    color: "#1B3344",
    textColor: "#EFE9DC",
    targetSection: "dispatch",
  },
];

function InteractiveKeycap({
  cap,
  onPress,
}: {
  cap: KeycapDef;
  onPress: (sectionId: string, label: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = pressed ? 0.14 : hovered ? 0.44 : cap.position[1];
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      Math.min(1, delta * 14)
    );
  });

  return (
    <group
      ref={groupRef}
      position={cap.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        setPressed(false);
        document.body.style.cursor = "auto";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setPressed(true);
        onPress(cap.targetSection, cap.label);
      }}
      onPointerUp={() => setPressed(false)}
    >
      {/* Switch stem */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.7]} />
        <meshStandardMaterial color="#151E28" roughness={0.6} />
      </mesh>

      {/* Main Sculpted Keycap */}
      <RoundedBox args={[1.45, 0.56, 1.38]} radius={0.14} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial
          color={cap.color}
          roughness={0.35}
          metalness={0.08}
          emissive={hovered ? cap.color : "#000000"}
          emissiveIntensity={hovered ? 0.14 : 0}
        />
      </RoundedBox>

      {/* Top Legend */}
      <Text
        position={[0, 0.295, -0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        fontWeight={800}
        color={cap.textColor}
        anchorX="center"
        anchorY="middle"
      >
        {cap.label}
      </Text>
      <Text
        position={[0, 0.295, 0.28]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        fontWeight={600}
        color={cap.textColor}
        fillOpacity={0.72}
        anchorX="center"
        anchorY="middle"
      >
        {cap.sub}
      </Text>
    </group>
  );
}

function KeyboardIsland({
  onSelectSection,
}: {
  onSelectSection: (sectionId: string, label: string) => void;
}) {
  const rigRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (rigRef.current) {
      const targetRotY = -0.42 + state.pointer.x * 0.28;
      const targetRotX = 0.48 - state.pointer.y * 0.18;
      rigRef.current.rotation.y = THREE.MathUtils.lerp(
        rigRef.current.rotation.y,
        targetRotY,
        Math.min(1, delta * 4)
      );
      rigRef.current.rotation.x = THREE.MathUtils.lerp(
        rigRef.current.rotation.x,
        targetRotX,
        Math.min(1, delta * 4)
      );
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.18;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.12;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={rigRef} rotation={[0.48, -0.42, 0]} position={[0, 0.15, 0]}>
        {/* Matte Warm Cream Keyboard Chassis */}
        <RoundedBox args={[3.7, 0.52, 3.5]} radius={0.22} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#DFD8C8" roughness={0.55} metalness={0.05} />
        </RoundedBox>

        {/* Recessed Dark Petrol Well */}
        <RoundedBox args={[3.32, 0.12, 3.12]} radius={0.1} smoothness={3} position={[0, 0.23, 0]}>
          <meshStandardMaterial color="#151E28" roughness={0.7} />
        </RoundedBox>

        {/* Interactive 3D Mechanical Keys */}
        {KEYCAPS.map((cap) => (
          <InteractiveKeycap key={cap.id} cap={cap} onPress={onSelectSection} />
        ))}

        {/* Orbiting Image #8 Coral & Amber Signal Rings */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <torusGeometry args={[2.65, 0.032, 16, 80]} />
          <meshStandardMaterial color="#E85A2A" roughness={0.3} emissive="#E85A2A" emissiveIntensity={0.25} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 2.2, 0.2, 0]} position={[0, -0.18, 0]}>
          <torusGeometry args={[3.05, 0.022, 16, 80]} />
          <meshStandardMaterial color="#F4A938" roughness={0.3} emissive="#F4A938" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroKeycapScene({
  onSelectSection,
}: {
  onSelectSection: (sectionId: string, label: string) => void;
}) {
  return (
    <div className="relative h-[380px] w-full sm:h-[460px] lg:h-[520px]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 3.1, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.78} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.35}
          castShadow
          color="#FFF7E8"
        />
        <pointLight position={[-5, 3, -3]} intensity={0.9} color="#E85A2A" />
        <pointLight position={[4, -2, 4]} intensity={0.7} color="#F4A938" />

        <KeyboardIsland onSelectSection={onSelectSection} />

        <ContactShadows
          position={[0, -1.75, 0]}
          opacity={0.42}
          scale={10}
          blur={2.4}
          far={4}
          color="#0C141C"
        />
      </Canvas>
    </div>
  );
}
