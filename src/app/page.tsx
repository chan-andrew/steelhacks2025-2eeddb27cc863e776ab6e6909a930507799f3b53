'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClientOnly3D } from '@/components/ClientOnly3D';
import { NavigationControls } from '@/components/ui/NavigationControls';
import { MachineStatusPanel } from '@/components/ui/MachineStatusPanel';
import { EnhancedFloorScrollBar } from '@/components/ui/EnhancedFloorScrollBar';
import { MuscleSidebar } from '@/components/ui/MuscleSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'; // fixed import
import { useGymState } from '@/hooks/useGymState';
import { Machine } from '@/types/gym';
import { getMachines, setMachineInUse, setMachineNotInUse } from './server';

export default function Home() {
  const { gymState, selectedFloor, selectedMachine, actions } = useGymState();
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const actionsRef = useRef(actions);
  const lastUpdatedMachineRef = useRef<{ id: number, timestamp: number } | null>(null);
  
  // Keep actionsRef current
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  const isFloorDetailView = gymState.currentView.type === 'floor-detail';
  const showBackButton = isFloorDetailView;

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      // Handle machine status updates
      if (data.operationType === 'update' && data.updateDescription?.updatedFields?.in_use !== undefined) {
        // Get the machine ID from the full document (not the MongoDB _id)
        if (!data.fullDocument || typeof data.fullDocument.id !== 'number') {
          console.log('Cannot determine machine ID from change stream');
          return;
        }
        
        const machineId = data.fullDocument.id; // Use the machine's actual id field
        const newInUseStatus = data.updateDescription.updatedFields.in_use;
        
        // Avoid updating if this machine was just manually updated in the last 2 seconds
        const lastUpdate = lastUpdatedMachineRef.current;
        if (lastUpdate && lastUpdate.id === machineId && Date.now() - lastUpdate.timestamp < 2000) {
          return;
        }
        
        // Update local state
        setAllMachines(prev => 
          prev.map(machine => 
            machine.id === machineId 
              ? { ...machine, in_use: newInUseStatus }
              : machine
          )
        );
        
        // Update gym state - use the ref to avoid dependency issues
        actionsRef.current.updateMachineStatus(machineId, newInUseStatus);
      }
    };

    getMachines().then(machines => {
      const mappedMachines = machines.map(machine => ({
        id: machine.id,
        name: machine.name,
        floor: machine.floor,
        in_use: machine.in_use,
        muscles: machine.muscles, // Database already has muscles as array
        x: machine.x,
        y: machine.y,
        // Better position calculation - map from 0-20 range to -5 to +5 range with increased spacing
        position: [((machine.x - 10) / 1.5), 0, ((machine.y - 10) / 1.5)] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        dimensions: [0.8, 0.1, 0.8] as [number, number, number]
      }));
      
      setAllMachines(mappedMachines);
      actionsRef.current.loadMachines(mappedMachines);
    }).catch(error => {
      console.error('Error loading machines:', error);
    });

    return () => {
      eventSource.close();
    };
  }, []); // Remove actions dependency to prevent infinite loop

  const handleMuscleGroupSelect = (muscleGroup: string | undefined) => {
    actions.setFilteredMuscleGroup(muscleGroup);
  };

  const handleMachineTypeSelect = (machineType: string | undefined) => {
    actions.setFilteredMachineType(machineType);
  };

  const handleMachineSelect = (machineId: number | Machine) => {
    const id = typeof machineId === 'number' ? machineId : machineId.id;
    const machine = typeof machineId === 'number' 
      ? allMachines.find(m => m.id === machineId)
      : machineId;
    
    if (machine) {
      // Just select the machine directly - no floor transitions or loading
      actions.selectMachine(id);
    }
  };

  const handleMachineToggle = async (machineId: number) => {
    try {
      // Find the machine from current state to ensure we have the most up-to-date data
      const currentMachine = gymState.floors
        .flatMap(floor => floor.machines)
        .find(m => m.id === machineId);
      
      if (!currentMachine) {
        return;
      }

      const newInUseStatus = !currentMachine.in_use;

      // Track that we're manually updating this machine
      lastUpdatedMachineRef.current = { id: machineId, timestamp: Date.now() };

      // Update the database first
      const result = newInUseStatus 
        ? await setMachineInUse(machineId)
        : await setMachineNotInUse(machineId);

      if (result.success) {
        // Update local state only if database update was successful
        actions.toggleMachineStatus(machineId);
      }
    } catch (error) {
      console.error('Error toggling machine status:', error);
    }
  };

  return (
    <main className="w-screen
     h-screen overflow-hidden relative" style={{ background: 'radial-gradient(ellipse at center, #DAA520 20%, #B8860B 60%, #8B6914 100%)' }}>
      {/* Title */}
      {!isFloorDetailView && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-primary-white">
              Gym Floor Planner
            </h1>
            <p className="text-primary-white/70 text-lg">Tap a floor to explore</p>
          </div>
        </div>
      )}

      {/* 3D Visualization - Client-side only */}
      <Suspense fallback={<LoadingSpinner />}>
        <ClientOnly3D 
          className="w-full h-full"
          gymState={gymState}
          onFloorSelect={actions.selectFloor}
          onMachineSelect={handleMachineSelect}
          onMachineToggle={handleMachineToggle}
          onReturnToOverview={actions.returnToOverview}
        />
      </Suspense>

      {/* Muscle Sidebar */}
      <MuscleSidebar
        machines={allMachines}
        onMuscleGroupSelect={handleMuscleGroupSelect}
        onMachineTypeSelect={handleMachineTypeSelect}
        onMachineSelect={(machine) => handleMachineSelect(machine)}
        selectedMuscleGroup={gymState.filteredMuscleGroup}
        selectedMachineType={gymState.filteredMachineType}
        selectedMachine={selectedMachine}
      />

      {/* Navigation Controls */}
      <NavigationControls
        showBackButton={showBackButton}
        onBack={actions.returnToOverview}
      />

      {/* Machine Status Panel */}
      {selectedMachine && (
        <MachineStatusPanel
          machine={selectedMachine}
          onToggleStatus={() => handleMachineToggle(selectedMachine.id)}
          onClose={() => actions.selectMachine(undefined)} // fixed close
        />
      )}

      {/* Floor Detail Instructions */}
      {isFloorDetailView && selectedFloor && !gymState.isTransitioning && (
        <motion.div
          className="fixed top-8 left-0 right-0 z-20 pointer-events-none flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 1.0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div className="glass-effect p-4 rounded-xl text-center">
            <motion.h2
              className="text-lg font-semibold text-primary-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 1.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {selectedFloor.name}
            </motion.h2>
            <motion.p
              className="text-primary-white/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              Tap machines to view details • Double-tap to toggle status
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* Floor Scroll Bar */}
      <EnhancedFloorScrollBar
        totalFloors={5}
        currentFloor={selectedFloor?.id}
        onFloorSelect={actions.selectFloor}
        isInDetailView={isFloorDetailView}
      />

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 glass-effect p-2 rounded-lg text-xs text-primary-white/70">
          <div>View: {gymState.currentView.type}</div>
          <div>Floors: {gymState.floors.length}</div>
          <div>Machines: {allMachines.length}</div>
          {gymState.filteredMuscleGroup && (
            <div>Filter: {gymState.filteredMuscleGroup}</div>
          )}
        </div>
      )}
    </main>
  );
}
