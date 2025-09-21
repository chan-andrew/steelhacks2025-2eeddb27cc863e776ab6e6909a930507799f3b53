'use client';

import { useState, useCallback, useMemo } from 'react';
import { GymState, GymFloor, Machine, CameraState } from '@/types/gym';

const FLOOR_COLORS = [
  '#FFFFFF', // White
  '#FFFFFF', // White
  '#FFFFFF', // White
  '#FFFFFF', // White
  '#FFFFFF', // White
];

const createInitialFloors = (): GymFloor[] => {
  return Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `Floor ${index + 1}`,
    level: index + 1,
    machines: [], // Start with empty machines, will be loaded from MongoDB
    color: FLOOR_COLORS[index],
    opacity: 0.3,
    isSelected: false,
  }));
};

const INITIAL_CAMERA_STATE: CameraState = {
  position: [18, 18, 18], // More balanced isometric angle - equal X, Y, Z for better perspective
  target: [0, 0, 0], // Look at center of cube
  fov: 50, // Slightly wider FOV
};

const FLOOR_DETAIL_CAMERA_STATE: CameraState = {
  position: [0, 30, 0], // Higher up for less zoom
  target: [0, 0, 0], // Look at center of selected floor
  fov: 75, // Wider field of view for less zoom
};

export const useGymState = () => {
  const [gymState, setGymState] = useState<GymState>({
    floors: createInitialFloors(),
    currentView: {
      type: 'overview',
      cameraState: INITIAL_CAMERA_STATE,
    },
    isTransitioning: false,
    selectedMachine: undefined,
  });

  const selectFloor = useCallback((floorId: number) => {
    const floorY = (floorId - 3) * 1.5; // Match the floor positioning
    
    // Phase 1: Start fade-out of other floors (0-800ms)
    setGymState(prev => ({
      ...prev,
      isTransitioning: true,
      floors: prev.floors.map(floor => ({
        ...floor,
        isSelected: floor.id === floorId,
        opacity: floor.id === floorId ? 0.8 : 0.1, // Start fading other floors
      })),
    }));

    // Phase 2: Complete fade-out and start camera movement (800ms)
    setTimeout(() => {
      setGymState(prev => ({
        ...prev,
        floors: prev.floors.map(floor => ({
          ...floor,
          isSelected: floor.id === floorId,
          opacity: floor.id === floorId ? 0.8 : 0, // Complete fade-out
        })),
        currentView: {
          type: 'floor-detail',
          selectedFloor: floorId,
          cameraState: {
            ...FLOOR_DETAIL_CAMERA_STATE,
            position: [0, floorY + 25, 0], // Higher camera position for less zoom
            target: [0, floorY, 0], // Look down at selected floor
          },
        },
      }));
    }, 800);

    // Phase 3: Reset transition state after full animation (1200ms total)
    setTimeout(() => {
      setGymState(prev => ({ ...prev, isTransitioning: false }));
    }, 1200);
  }, []);

  const returnToOverview = useCallback(() => {
    setGymState(prev => ({
      ...prev,
      isTransitioning: true,
      floors: prev.floors.map(floor => ({
        ...floor,
        isSelected: false,
        opacity: 0.3,
      })),
      currentView: {
        type: 'overview',
        cameraState: INITIAL_CAMERA_STATE,
      },
      selectedMachine: undefined,
    }));

    // Reset transition state after animation
    setTimeout(() => {
      setGymState(prev => ({ ...prev, isTransitioning: false }));
    }, 1200); // Match the transition duration
  }, []);

  const resetToMainPage = useCallback(() => {
    console.log('🏠 Home button clicked - resetting to main page');
    // Complete reset to initial state - like refreshing the page
    setGymState({
      floors: createInitialFloors(),
      currentView: {
        type: 'overview',
        cameraState: INITIAL_CAMERA_STATE,
      },
      isTransitioning: true,
      selectedMachine: undefined,
    });

    // Reset transition state after animation
    setTimeout(() => {
      setGymState(prev => ({ ...prev, isTransitioning: false }));
    }, 1200);
  }, []);

  const toggleMachineStatus = useCallback((machineId: number) => {
    console.log('Toggling machine status for machine:', machineId);
    setGymState(prev => {
      const newState = {
        ...prev,
        floors: prev.floors.map(floor => ({
          ...floor,
          machines: floor.machines.map(machine =>
            machine.id === machineId
              ? { ...machine, in_use: !machine.in_use }
              : machine
          ),
        })),
      };
      console.log('After toggle, floor machine counts:', newState.floors.map(f => ({ id: f.id, count: f.machines.length })));
      return newState;
    });
  }, []);

  const selectMachine = useCallback((machineId: number | undefined) => {
      setGymState(prev => ({
        ...prev,
        selectedMachine: machineId,
      }));
    }, []);

  const loadMachines = useCallback((machines: Machine[]) => {
    console.log('Loading machines:', machines.length, 'total machines');
    // Group machines by floor
    const machinesByFloor: { [key: number]: Machine[] } = {};
    machines.forEach(machine => {
      if (!machinesByFloor[machine.floor]) {
        machinesByFloor[machine.floor] = [];
      }
      machinesByFloor[machine.floor].push(machine);
    });

    console.log('Machines grouped by floor:', Object.keys(machinesByFloor).map(id => ({ floor: id, count: machinesByFloor[parseInt(id)].length })));

    setGymState(prev => {
      const newState = {
        ...prev,
        floors: prev.floors.map(floor => ({
          ...floor,
          machines: machinesByFloor[floor.id] || []
        }))
      };
      console.log('After loading, floor machine counts:', newState.floors.map(f => ({ id: f.id, count: f.machines.length })));
      return newState;
    });
  }, []);

  const updateMachineStatus = useCallback((machineId: number, inUse: boolean) => {
    console.log('Updating machine status:', machineId, 'to', inUse);
    setGymState(prev => {
      const newState = {
        ...prev,
        floors: prev.floors.map(floor => ({
          ...floor,
          machines: floor.machines.map(machine =>
            machine.id === machineId
              ? { ...machine, in_use: inUse }
              : machine
          ),
        })),
      };
      console.log('After update, floor machine counts:', newState.floors.map(f => ({ id: f.id, count: f.machines.length })));
      return newState;
    });
  }, []);

  const setFilteredMuscleGroup = useCallback((muscleGroup: string | undefined) => {
    setGymState(prev => ({
      ...prev,
      filteredMuscleGroup: muscleGroup
    }));
  }, []);

  const setCurrentPosition = useCallback((position: { floor: number; x: number; y: number }) => {
    setGymState(prev => ({
      ...prev,
      currentPosition: position
    }));
  }, []);

  const selectedFloor = useMemo(() => {
    if (gymState.currentView.type === 'floor-detail' && gymState.currentView.selectedFloor) {
      return gymState.floors.find(floor => floor.id === gymState.currentView.selectedFloor);
    }
    return undefined;
  }, [gymState.floors, gymState.currentView]);

  const selectedMachine = useMemo(() => {
    if (!gymState.selectedMachine) return undefined;
    
    for (const floor of gymState.floors) {
      const machine = floor.machines.find(m => m.id === gymState.selectedMachine);
      if (machine) return machine;
    }
    return undefined;
  }, [gymState.floors, gymState.selectedMachine]);

  return {
    gymState,
    selectedFloor,
    selectedMachine,
    actions: {
      selectFloor,
      returnToOverview,
      resetToMainPage,
      toggleMachineStatus,
      selectMachine,
      loadMachines,
      updateMachineStatus,
      setFilteredMuscleGroup,
      setCurrentPosition,
    },
  };
};
