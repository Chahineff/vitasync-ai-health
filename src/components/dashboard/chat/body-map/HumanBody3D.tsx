import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Anatomy part definition ─── */
export interface AnatomyPart {
  id: string;
  label: string;
  position: [number, number, number];
  scale: [number, number, number];
  geometry: 'capsule' | 'sphere' | 'box';
  rotation?: [number, number, number];
}

/* ─── Full body parts (approx. 30 zones) ─── */
const BODY_PARTS: AnatomyPart[] = [
  // Head
  { id: 'head', label: 'Tête', position: [0, 1.62, 0], scale: [0.11, 0.14, 0.12], geometry: 'sphere' },
  // Neck
  { id: 'neck', label: 'Cou', position: [0, 1.44, 0], scale: [0.05, 0.06, 0.05], geometry: 'capsule' },

  // Torso
  { id: 'chest', label: 'Poitrine', position: [0, 1.25, 0], scale: [0.18, 0.12, 0.1], geometry: 'box', rotation: [0, 0, 0] },
  { id: 'upper-abs', label: 'Abdominaux hauts', position: [0, 1.08, 0], scale: [0.16, 0.06, 0.09], geometry: 'box' },
  { id: 'lower-abs', label: 'Abdominaux bas', position: [0, 0.96, 0], scale: [0.15, 0.06, 0.09], geometry: 'box' },
  { id: 'upper-back', label: 'Haut du dos', position: [0, 1.25, -0.02], scale: [0.18, 0.12, 0.08], geometry: 'box' },
  { id: 'lower-back', label: 'Lombaires', position: [0, 1.0, -0.03], scale: [0.15, 0.08, 0.07], geometry: 'box' },

  // Shoulders
  { id: 'left-shoulder', label: 'Épaule gauche', position: [-0.22, 1.34, 0], scale: [0.07, 0.06, 0.07], geometry: 'sphere' },
  { id: 'right-shoulder', label: 'Épaule droite', position: [0.22, 1.34, 0], scale: [0.07, 0.06, 0.07], geometry: 'sphere' },

  // Upper Arms
  { id: 'left-bicep', label: 'Biceps gauche', position: [-0.28, 1.2, 0], scale: [0.045, 0.1, 0.045], geometry: 'capsule' },
  { id: 'right-bicep', label: 'Biceps droit', position: [0.28, 1.2, 0], scale: [0.045, 0.1, 0.045], geometry: 'capsule' },

  // Elbows
  { id: 'left-elbow', label: 'Coude gauche', position: [-0.3, 1.06, 0], scale: [0.04, 0.035, 0.04], geometry: 'sphere' },
  { id: 'right-elbow', label: 'Coude droit', position: [0.3, 1.06, 0], scale: [0.04, 0.035, 0.04], geometry: 'sphere' },

  // Forearms
  { id: 'left-forearm', label: 'Avant-bras gauche', position: [-0.32, 0.92, 0], scale: [0.038, 0.09, 0.038], geometry: 'capsule' },
  { id: 'right-forearm', label: 'Avant-bras droit', position: [0.32, 0.92, 0], scale: [0.038, 0.09, 0.038], geometry: 'capsule' },

  // Hands
  { id: 'left-hand', label: 'Main gauche', position: [-0.34, 0.78, 0], scale: [0.04, 0.05, 0.02], geometry: 'box' },
  { id: 'right-hand', label: 'Main droite', position: [0.34, 0.78, 0], scale: [0.04, 0.05, 0.02], geometry: 'box' },

  // Hips
  { id: 'left-hip', label: 'Hanche gauche', position: [-0.1, 0.88, 0], scale: [0.08, 0.05, 0.08], geometry: 'sphere' },
  { id: 'right-hip', label: 'Hanche droite', position: [0.1, 0.88, 0], scale: [0.08, 0.05, 0.08], geometry: 'sphere' },

  // Upper Legs
  { id: 'left-quad', label: 'Cuisse gauche', position: [-0.1, 0.72, 0], scale: [0.07, 0.12, 0.07], geometry: 'capsule' },
  { id: 'right-quad', label: 'Cuisse droite', position: [0.1, 0.72, 0], scale: [0.07, 0.12, 0.07], geometry: 'capsule' },

  // Knees
  { id: 'left-knee', label: 'Genou gauche', position: [-0.1, 0.56, 0], scale: [0.05, 0.04, 0.05], geometry: 'sphere' },
  { id: 'right-knee', label: 'Genou droit', position: [0.1, 0.56, 0], scale: [0.05, 0.04, 0.05], geometry: 'sphere' },

  // Lower Legs
  { id: 'left-shin', label: 'Tibia gauche', position: [-0.1, 0.4, 0], scale: [0.045, 0.11, 0.045], geometry: 'capsule' },
  { id: 'right-shin', label: 'Tibia droit', position: [0.1, 0.4, 0], scale: [0.045, 0.11, 0.045], geometry: 'capsule' },

  // Ankles
  { id: 'left-ankle', label: 'Cheville gauche', position: [-0.1, 0.26, 0], scale: [0.04, 0.03, 0.04], geometry: 'sphere' },
  { id: 'right-ankle', label: 'Cheville droite', position: [0.1, 0.26, 0], scale: [0.04, 0.03, 0.04], geometry: 'sphere' },

  // Feet
  { id: 'left-foot', label: 'Pied gauche', position: [-0.1, 0.2, 0.03], scale: [0.045, 0.025, 0.08], geometry: 'box' },
  { id: 'right-foot', label: 'Pied droit', position: [0.1, 0.2, 0.03], scale: [0.045, 0.025, 0.08], geometry: 'box' },
];

export { BODY_PARTS };

/* ─── Skin material ─── */
const SKIN_COLOR = new THREE.Color('#e8b090');
const SKIN_COLOR_HOVER = new THREE.Color('#f0c8a8');
const SELECTED_COLOR = new THREE.Color('#ef4444');
const SELECTED_GLOW = new THREE.Color('#ff6b6b');

/* ─── Single body part mesh ─── */
function BodyPartMesh({
  part,
  isSelected,
  isHovered,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: {
  part: AnatomyPart;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Pulsing animation for selected parts
  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
      meshRef.current.scale.set(
        part.scale[0] * pulse,
        part.scale[1] * pulse,
        part.scale[2] * pulse
      );
    }
  });

  const color = isSelected ? SELECTED_COLOR : isHovered ? SKIN_COLOR_HOVER : SKIN_COLOR;
  const emissive = isSelected ? SELECTED_GLOW : isHovered ? new THREE.Color('#ffddcc') : new THREE.Color('#000000');
  const emissiveIntensity = isSelected ? 0.4 : isHovered ? 0.15 : 0;

  const geometry = useMemo(() => {
    switch (part.geometry) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 24, 24);
      case 'capsule':
        return new THREE.CapsuleGeometry(0.6, 1, 12, 24);
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
      default:
        return new THREE.SphereGeometry(1, 24, 24);
    }
  }, [part.geometry]);

  return (
    <mesh
      ref={meshRef}
      position={part.position}
      scale={part.scale}
      rotation={part.rotation ? [part.rotation[0], part.rotation[1], part.rotation[2]] : undefined}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={(e) => { e.stopPropagation(); onPointerEnter(); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); onPointerLeave(); document.body.style.cursor = 'default'; }}
      geometry={geometry}
    >
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.05}
      />
    </mesh>
  );
}

/* ─── Pain marker (floating red sphere on selected parts) ─── */
function PainMarker({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = position[1] + 0.08 + Math.sin(t * 2) * 0.015;
      ref.current.scale.setScalar(0.018 + Math.sin(t * 3) * 0.004);
    }
  });

  return (
    <mesh ref={ref} position={[position[0], position[1] + 0.08, position[2] + 0.08]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={0.8} transparent opacity={0.9} />
    </mesh>
  );
}

/* ─── Main scene ─── */
interface HumanBody3DProps {
  selectedParts: Set<string>;
  onTogglePart: (id: string) => void;
  onHoverPart: (id: string | null) => void;
}

export function HumanBody3D({ selectedParts, onTogglePart, onHoverPart }: HumanBody3DProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
      <pointLight position={[0, 2, 3]} intensity={0.4} color="#ffeedd" />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={0.6}
        maxDistance={2.5}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        target={[0, 1.0, 0]}
        autoRotate={false}
      />

      {/* Floor reference (subtle) */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color="#666" transparent opacity={0.1} />
      </mesh>

      {/* Body parts */}
      {BODY_PARTS.map(part => (
        <BodyPartMesh
          key={part.id}
          part={part}
          isSelected={selectedParts.has(part.id)}
          isHovered={false}
          onClick={() => onTogglePart(part.id)}
          onPointerEnter={() => onHoverPart(part.id)}
          onPointerLeave={() => onHoverPart(null)}
        />
      ))}

      {/* Pain markers on selected parts */}
      {BODY_PARTS.filter(p => selectedParts.has(p.id)).map(part => (
        <PainMarker key={`marker-${part.id}`} position={part.position} />
      ))}
    </>
  );
}
