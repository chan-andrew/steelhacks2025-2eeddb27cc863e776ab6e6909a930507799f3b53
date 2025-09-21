'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Machine } from '@/types/gym';
import { getMachineIcon } from '@/utils/iconMapping';

// Component to display machine icon
const MachineIcon = ({ 
  iconPath, 
  position, 
  onClick, 
  onDoubleClick, 
  onPointerOver, 
  onPointerOut 
}: { 
  iconPath: string; 
  position: [number, number, number];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onDoubleClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}) => {
  try {
    const texture = useLoader(THREE.TextureLoader, iconPath);
    
    return (
      <mesh 
        position={position} 
        rotation={[-Math.PI / 2, 0, 3 * Math.PI / 2]}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          alphaTest={0.1}
          side={THREE.DoubleSide}
          color={0xffffff}
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

const getMachineColor = (machine: Machine, isSelected: boolean, isFiltered: boolean = false, isHovered: boolean = false) => {
  if (isSelected) {
    return '#FFD700'; // Gold for selected (always visible)
  }
  
  if (isHovered) {
    return '#00BFFF'; // Light blue for hovered
  }
  
  if (isFiltered) {
    return '#666666'; // Darker gray for filtered but still visible
  }
  
  if (machine.in_use) {
    return '#FF0000'; // Red for in use
  }
  
  // Light blue for available machines
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
  const [isHovered, setIsHovered] = useState(false);
  
  const color = getMachineColor(machine, isSelected, isFiltered, isHovered);
  const iconPath = getMachineIcon(machine.name);

  // Force recalculated position with increased spacing
  const position: [number, number, number] = useMemo(() => [
    (machine.x - 10) / 1.5, // Increased spacing - force calculation
    0.5, // Much higher above floor to avoid click conflicts
    (machine.y - 10) / 1.5  // Increased spacing - force calculation
  ], [machine.x, machine.y]);

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
      opacity: isFiltered ? 0.6 : 1.0, // Full opacity for available machines
      emissive: color,
      emissiveIntensity: isHovered ? 0.4 : 0.2, // Brighter when hovered
      depthTest: true,
      depthWrite: true,
    });
  }, [color, isFiltered, isHovered]);

  return (
    <group
      ref={machineRef}
      position={position}
      renderOrder={1} // Render above floor
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
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e?.stopPropagation?.();
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Flat Machine Icon - very thin box with rounded corners */}
      <RoundedBox
        ref={iconRef}
        args={[1.4, 0.1, 1.4]} // Even bigger flat icon dimensions
        radius={0.05} // Small rounded corners
        smoothness={4} // Smoothness of the rounded corners
        material={machineMaterial}
        castShadow
        receiveShadow
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
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      />

      {/* Machine Icon - display the actual icon image on top of the machine */}
      {iconPath && (
        <MachineIcon 
          iconPath={iconPath} 
          position={[0, 0.06, 0]} // Slightly above the machine box
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
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
        />
      )}

      {/* Machine Name Label - Always visible in front of the machine */}
      <Text
        position={[-1.0, 0.15, 0]} // Moved 90 degrees to the left (negative x-axis)
        fontSize={0.16}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]} // Rotate to face upward and text 90 degrees to the right
        outlineWidth={0.02}
        outlineColor="#000000"
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
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {machine.name}
      </Text>

      {/* Selection Ring */}
      {isSelected && (
        <mesh 
          position={[0, -0.01, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
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
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Filtered Ring - subtle indicator for filtered machines */}
      {isFiltered && !isSelected && (
        <mesh 
          position={[0, -0.005, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
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
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
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
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
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
