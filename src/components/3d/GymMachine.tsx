'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Machine } from '@/types/gym';

interface GymMachineProps {
  machine: Machine;
  isSelected: boolean;
  onClick: () => void;
  onToggle: () => void;
}

const getMachineColor = (machine: Machine, isSelected: boolean) => {
  if (machine.in_use) {
    return '#FF0000'; // Red for in use
  }
  
  if (isSelected) {
    return '#FFD700'; // Gold for selected
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

// Removed unused getMachineGeometry function

export const GymMachine = ({ machine, isSelected, onClick, onToggle }: GymMachineProps) => {
  const machineRef = useRef<THREE.Group>(null);
  const mainBodyRef = useRef<THREE.Mesh>(null);
  
  const color = getMachineColor(machine, isSelected);

  // Animate machine
  useFrame((state) => {
    if (machineRef.current && machine.position) {
      // Subtle hover animation when selected
      if (isSelected) {
        machineRef.current.position.y = 
          machine.position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        if (machine.rotation) {
          machineRef.current.rotation.y = 
            machine.rotation[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
      } else {
        machineRef.current.position.y = machine.position[1];
        if (machine.rotation) {
          machineRef.current.rotation.y = machine.rotation[1];
        }
      }
    }

    // Glow effect for selected machine
    if (mainBodyRef.current) {
      const material = mainBodyRef.current.material as THREE.MeshStandardMaterial;
      if (isSelected) {
        material.emissive.setHex(0x333333);
        material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      } else if (machine.in_use) {
        material.emissive.setHex(0x441111);
        material.emissiveIntensity = 0.2;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    }
  });

  const machineMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: machine.in_use ? 0.9 : 0.8,
    });
  }, [color, machine.in_use]);

  // Removed unused accentMaterial

  return (
    <group
      ref={machineRef}
      position={machine.position || [0, 0, 0]}
      rotation={machine.rotation || [0, 0, 0]}
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
        ref={mainBodyRef}
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
