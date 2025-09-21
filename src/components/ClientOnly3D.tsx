'use client';

import dynamic from 'next/dynamic';
import { LoadingScreen } from './ui/LoadingSpinner';
import { GymState } from '@/types/gym';

const GymFloorVisualization = dynamic(
  () => import('./3d/GymFloorVisualization').then(mod => ({ default: mod.GymFloorVisualization })),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

interface ClientOnly3DProps {
  className?: string;
  gymState: GymState;
  onFloorSelect: (floorId: number) => void;
  onMachineSelect: (machineId: number) => void;
  onMachineToggle: (machineId: number) => void;
  onReturnToOverview: () => void;
}

export const ClientOnly3D = ({ 
  className,
  gymState,
  onFloorSelect,
  onMachineSelect,
  onMachineToggle,
  onReturnToOverview
}: ClientOnly3DProps) => {
  return (
    <GymFloorVisualization 
      className={className}
      gymState={gymState}
      onFloorSelect={onFloorSelect}
      onMachineSelect={onMachineSelect}
      onMachineToggle={onMachineToggle}
      onReturnToOverview={onReturnToOverview}
    />
  );
};
