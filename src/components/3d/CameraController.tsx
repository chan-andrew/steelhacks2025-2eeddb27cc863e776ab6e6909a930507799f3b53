'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { CameraState } from '@/types/gym';

interface CameraControllerProps {
  targetState: CameraState;
  isTransitioning: boolean;
  transitionDuration: number;
  viewType?: 'overview' | 'floor-detail';
}

export const CameraController = ({ 
  targetState, 
  isTransitioning,
  transitionDuration = 1200,
  viewType = 'overview'
}: CameraControllerProps) => {
  const { camera } = useThree();
  const startTime = useRef<number>(0);
  const startPosition = useRef(new Vector3());
  const startTarget = useRef(new Vector3());
  const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (isTransitioning) {
      startTime.current = Date.now();
      startPosition.current.copy(camera.position);
      
      // Get current target from controls if available
      if (controlsRef.current) {
        startTarget.current.copy(controlsRef.current.target);
      }
    }
  }, [isTransitioning, camera]);

  useFrame(() => {
    if (isTransitioning && startTime.current > 0) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      // Cubic-bezier easing function: cubic-bezier(0.25, 0.46, 0.45, 0.94)
      const cubicBezierEase = (t: number): number => {
        // Approximation of cubic-bezier(0.25, 0.46, 0.45, 0.94)
        return t * t * (3 - 2 * t); // Smooth step function as approximation
      };
      
      const easeProgress = cubicBezierEase(progress);

      // Interpolate camera position
      const targetPos = new Vector3(...targetState.position);
      const currentPos = startPosition.current.clone().lerp(targetPos, easeProgress);
      camera.position.copy(currentPos);

      // Interpolate camera target (look-at point)
      const targetLookAt = new Vector3(...targetState.target);
      const currentTarget = startTarget.current.clone().lerp(targetLookAt, easeProgress);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentTarget);
        controlsRef.current.update();
      } else {
        camera.lookAt(currentTarget);
      }

      // Interpolate FOV (only for PerspectiveCamera)
      if ('fov' in camera) {
        camera.fov = camera.fov + (targetState.fov - camera.fov) * easeProgress * 0.1;
        camera.updateProjectionMatrix();
      }

      // Reset when transition is complete
      if (progress >= 1) {
        startTime.current = 0;
      }
    }
  });

  // Different constraints based on view type
  const getConstraints = () => {
    if (viewType === 'floor-detail') {
      return {
        minPolarAngle: Math.PI / 8, // More restrictive - can't go too low
        maxPolarAngle: Math.PI / 2, // Allow more top-down view
        minAzimuthAngle: -Math.PI, // Full rotation for detail view
        maxAzimuthAngle: Math.PI,
        minDistance: 5,
        maxDistance: 50,
      };
    } else {
      // Overview mode constraints
      return {
        minPolarAngle: Math.PI / 6, // Prevent camera from going too low (30 degrees)
        maxPolarAngle: Math.PI / 2.5, // Prevent camera from going too high (72 degrees)
        minAzimuthAngle: -Math.PI / 4, // Limit left rotation (45 degrees left)
        maxAzimuthAngle: Math.PI / 1.2, // Allow much more right rotation (150 degrees right)
        minDistance: 12,
        maxDistance: 30,
      };
    }
  };

  const constraints = getConstraints();

  return (
    <OrbitControls
      ref={controlsRef}
      target={targetState.target}
      enablePan={false} // Disable panning to keep camera focused
      enableZoom={true}
      enableRotate={!isTransitioning} // Disable rotation during transitions
      minPolarAngle={constraints.minPolarAngle}
      maxPolarAngle={constraints.maxPolarAngle}
      minAzimuthAngle={constraints.minAzimuthAngle}
      maxAzimuthAngle={constraints.maxAzimuthAngle}
      minDistance={constraints.minDistance}
      maxDistance={constraints.maxDistance}
      enableDamping
      dampingFactor={0.05}
    />
  );
};
