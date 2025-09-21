'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Machine } from '@/types/gym';

interface FlatGymMachineProps {
  machine: Machine;
  isSelected: boolean;
  isFiltered?: boolean;
  onClick: () => void;
  onToggle: () => void;
}

const getMachineColor = (machine: Machine, isSelected: boolean, isFiltered: boolean = false) => {
  if (machine.in_use) {
    return '#FF0000'; // Red for in use
  }
  
  if (isSelected) {
    return '#FFD700'; // Gold for selected
  }
  
  if (isFiltered) {
    return '#333333'; // Dark gray for filtered out
  }
  
  // Default colors based on muscle group
  const primaryMuscle = machine.muscles[0]?.toLowerCase() || '';
  
  if (primaryMuscle.includes('cardio')) return '#00CED1';
  if (primaryMuscle.includes('chest')) return '#4169E1';
  if (primaryMuscle.includes('back') || primaryMuscle.includes('lats')) return '#32CD32';
  if (primaryMuscle.includes('shoulder')) return '#FF6347';
  if (primaryMuscle.includes('biceps') || primaryMuscle.includes('triceps')) return '#9370DB';
  if (primaryMuscle.includes('quads') || primaryMuscle.includes('hamstrings') || primaryMuscle.includes('glutes')) return '#FFB347';
  if (primaryMuscle.includes('calves')) return '#20B2AA';
  if (primaryMuscle.includes('abs')) return '#FF69B4';
  
  return '#CCCCCC'; // Default gray
};

export const FlatGymMachine = ({ 
  machine, 
  isSelected, 
  isFiltered = false,
  onClick, 
  onToggle 
}: FlatGymMachineProps) => {
  const machineRef = useRef<THREE.Group>(null);
  const iconRef = useRef<THREE.Mesh>(null);
  
  const color = getMachineColor(machine, isSelected, isFiltered);

  // Convert grid coordinates to 3D position (16x16 grid, coordinates 4-16)
  const position: [number, number, number] = [
    (machine.x - 10) * 1.5, // Center around 0, spread out
    0.05, // Slightly above floor
    (machine.y - 10) * 1.5
  ];

  // Animate selected machines
  useFrame((state) => {
    if (machineRef.current && isSelected) {
      machineRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }

    // Pulsing effect for in-use machines
    if (iconRef.current && machine.in_use) {
      const material = iconRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  const machineMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: isFiltered ? 0.3 : (machine.in_use ? 0.9 : 0.8),
      emissive: machine.in_use ? color : '#000000',
      emissiveIntensity: machine.in_use ? 0.2 : 0,
    });
  }, [color, machine.in_use, isFiltered]);

  return (
    <group
      ref={machineRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Flat Machine Icon - very thin box */}
      <Box
        ref={iconRef}
        args={[0.8, 0.1, 0.8]} // Flat icon dimensions
        material={machineMaterial}
        castShadow
        receiveShadow
      />

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Machine Label (only show when selected) */}
      {isSelected && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {machine.name}
          {'\n'}
          Floor {machine.floor}
          {'\n'}
          {machine.in_use ? 'IN USE' : 'AVAILABLE'}
        </Text>
      )}
    </group>
  );
};
