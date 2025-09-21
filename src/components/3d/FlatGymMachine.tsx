'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Machine } from '@/types/gym';
import { getMachineIcon } from '@/utils/iconMapping';

// Component to display machine icon
const MachineIcon = ({ iconPath, position }: { iconPath: string; position: [number, number, number] }) => {
  try {
    const texture = useLoader(THREE.TextureLoader, iconPath);
    
    return (
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  } catch {
    // If icon fails to load, return null (no icon)
    console.log(`Failed to load icon: ${iconPath}`);
    return null;
  }
};

interface FlatGymMachineProps {
  machine: Machine;
  isSelected: boolean;
  isFiltered?: boolean;
  onClick: () => void;
  onToggle: () => void;
}

const getMachineColor = (machine: Machine, isSelected: boolean, isFiltered: boolean = false) => {
  if (isSelected) {
    return '#FFD700'; // Gold for selected (always visible)
  }
  
  if (isFiltered) {
    return '#666666'; // Darker gray for filtered but still visible
  }
  
  if (machine.in_use) {
    return '#FF0000'; // Red for in use
  }
  
  // Green for available machines
  return '#00FF00';
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
  const iconPath = getMachineIcon(machine.name);

  // Use the pre-calculated position from the machine object
  const position: [number, number, number] = useMemo(() => 
    machine.position || [
      (machine.x - 10) / 2, // Fallback calculation
      0.05, // Slightly above floor
      (machine.y - 10) / 2
    ], [machine.position, machine.x, machine.y]
  );

  // Ensure position is reset when selection changes
  useEffect(() => {
    if (machineRef.current && !isSelected) {
      machineRef.current.position.y = position[1];
    }
  }, [isSelected, position]);

  // Animate selected machines
  useFrame((state) => {
    if (machineRef.current) {
      if (isSelected) {
        // Animate position when selected
        machineRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      } else {
        // Reset to original position when not selected
        machineRef.current.position.y = position[1];
      }
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
      opacity: isFiltered ? 0.6 : (machine.in_use ? 0.9 : 0.8), // Make filtered machines more visible
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

      {/* Machine Icon - display the actual icon image on top of the machine */}
      {iconPath && (
        <MachineIcon 
          iconPath={iconPath} 
          position={[0, 0.06, 0]} // Slightly above the machine box
        />
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Filtered Ring - subtle indicator for filtered machines */}
      {isFiltered && !isSelected && (
        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#666666" transparent opacity={0.4} />
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
