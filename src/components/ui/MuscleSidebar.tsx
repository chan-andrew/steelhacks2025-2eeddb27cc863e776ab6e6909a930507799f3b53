'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Machine, MuscleGroup } from '@/types/gym';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MuscleSidebarProps {
  machines: Machine[];
  onMuscleGroupSelect: (muscleGroup: string | undefined) => void;
  onMachineTypeSelect: (machineType: string | undefined) => void;
  onMachineSelect: (machine: Machine) => void;
  selectedMuscleGroup?: string;
  selectedMachineType?: string;
  selectedMachine?: Machine;
  className?: string;
}

const MUSCLE_GROUPS = [
  'Chest',
  'Upper Back', 
  'Lats',
  'Biceps',
  'Triceps',
  'Shoulder',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Cardio',
  'Abs'
];

export const MuscleSidebar = ({
  machines,
  onMuscleGroupSelect,
  onMachineTypeSelect,
  onMachineSelect,
  selectedMuscleGroup,
  selectedMachineType: propSelectedMachineType,
  selectedMachine,
  className = ''
}: MuscleSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedMachineType, setLocalSelectedMachineType] = useState<string | undefined>(undefined);
  
  // Use prop value if available, otherwise use local state
  const selectedMachineType = propSelectedMachineType ?? localSelectedMachineType;

  const muscleGroupData: MuscleGroup[] = useMemo(() => {
    return MUSCLE_GROUPS.map(group => {
      const groupMachines = machines.filter(machine => 
        machine.muscles.some(muscle => 
          muscle.toLowerCase().includes(group.toLowerCase()) ||
          group.toLowerCase().includes(muscle.toLowerCase())
        )
      );
      
      const availableCount = groupMachines.filter(m => !m.in_use).length;
      
      return {
        name: group,
        machines: groupMachines,
        availableCount
      };
    });
  }, [machines]);

  const selectedGroupMachines = useMemo(() => {
    if (!selectedMuscleGroup) return [];
    const group = muscleGroupData.find(g => g.name === selectedMuscleGroup);
    return group ? group.machines : [];
  }, [selectedMuscleGroup, muscleGroupData]);

  // Group machines by their base name (e.g., "pec deck", "treadmill")
  const machineTypeGroups = useMemo(() => {
    if (!selectedGroupMachines.length) return [];
    
    const typeMap = new Map<string, Machine[]>();
    
    selectedGroupMachines.forEach(machine => {
      // Extract base machine type by removing numbers and extra descriptors
      const baseName = machine.name
        .toLowerCase()
        .replace(/\s*\d+$/, '') // Remove trailing numbers
        .replace(/\s*#\d+$/, '') // Remove # numbers
        .replace(/\s*-\s*\d+$/, '') // Remove - numbers
        .trim();
      
      if (!typeMap.has(baseName)) {
        typeMap.set(baseName, []);
      }
      typeMap.get(baseName)!.push(machine);
    });
    
    return Array.from(typeMap.entries()).map(([typeName, machines]) => ({
      name: typeName,
      machines: machines,
      availableCount: machines.filter(m => !m.in_use).length
    }));
  }, [selectedGroupMachines]);

  const selectedTypeMachines = useMemo(() => {
    if (!selectedMachineType) return [];
    const typeGroup = machineTypeGroups.find(g => g.name === selectedMachineType);
    return typeGroup ? typeGroup.machines : [];
  }, [selectedMachineType, machineTypeGroups]);

  const handleMuscleGroupClick = (group: string) => {
    const newSelection = selectedMuscleGroup === group ? undefined : group;
    onMuscleGroupSelect(newSelection);
    setLocalSelectedMachineType(undefined); // Reset machine type selection
    onMachineTypeSelect(undefined); // Notify parent
  };

  const handleMachineTypeClick = (typeName: string) => {
    setLocalSelectedMachineType(typeName);
    onMachineTypeSelect(typeName); // Notify parent
  };

  const handleMachineClick = (machine: Machine) => {
    onMachineSelect(machine);
    setIsOpen(false); // Close sidebar when machine is selected
  };

  const handleBackToMuscleGroups = () => {
    onMuscleGroupSelect(undefined);
    setLocalSelectedMachineType(undefined);
    onMachineTypeSelect(undefined); // Notify parent
  };

  const handleBackToMachineTypes = () => {
    setLocalSelectedMachineType(undefined);
    onMachineTypeSelect(undefined); // Notify parent
  };

  return (
    <>
      {/* Burger Menu Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 left-4 z-50 glass-effect w-12 h-12 rounded-xl flex items-center justify-center text-primary-white hover:text-accent-gold transition-colors duration-200 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Bars3Icon className="w-6 h-6" />
      </motion.button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 bg-black bg-opacity-90 backdrop-blur-md z-50 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-white">
                    Muscle Groups
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-primary-white hover:text-accent-gold transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content - Three Level Navigation */}
                {!selectedMuscleGroup ? (
                  /* Level 1: Muscle Groups List */
                  <div className="space-y-2">
                    {muscleGroupData.map((group) => (
                      <motion.button
                        key={group.name}
                        onClick={() => handleMuscleGroupClick(group.name)}
                        className="w-full p-3 text-left rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-primary-white font-medium">
                            {group.name}
                          </span>
                          <span className="text-accent-gold text-sm">
                            {group.availableCount}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : !selectedMachineType ? (
                  /* Level 2: Machine Types List */
                  <div className="space-y-2">
                    {/* Back Button */}
                    <motion.button
                      onClick={handleBackToMuscleGroups}
                      className="w-full p-3 text-left rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition-all duration-200 mb-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-accent-gold">← Back to Muscle Groups</span>
                    </motion.button>

                    {/* Selected Group Title */}
                    <h3 className="text-lg font-semibold text-primary-white mb-4">
                      {selectedMuscleGroup} Equipment
                    </h3>

                    {/* Machine Types */}
                    {machineTypeGroups.map((typeGroup) => (
                      <motion.button
                        key={typeGroup.name}
                        onClick={() => handleMachineTypeClick(typeGroup.name)}
                        className="w-full p-3 text-left rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-primary-white font-medium capitalize">
                            {typeGroup.name}
                          </span>
                          <span className="text-accent-gold text-sm">
                            {typeGroup.availableCount}/{typeGroup.machines.length}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  /* Level 3: Individual Machines List */
                  <div className="space-y-2">
                    {/* Back Button */}
                    <motion.button
                      onClick={handleBackToMachineTypes}
                      className="w-full p-3 text-left rounded-lg glass-effect hover:bg-white hover:bg-opacity-10 transition-all duration-200 mb-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-accent-gold">← Back to Equipment Types</span>
                    </motion.button>

                    {/* Selected Type Title */}
                    <h3 className="text-lg font-semibold text-primary-white mb-4 capitalize">
                      {selectedMachineType}
                    </h3>

                    {/* Individual Machines */}
                    {selectedTypeMachines.map((machine) => (
                      <motion.div
                        key={machine.id}
                        className={`p-3 rounded-lg glass-effect ${
                          selectedMachine?.id === machine.id ? 'ring-2 ring-accent-gold' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => handleMachineClick(machine)}
                            className="flex-1 text-left hover:bg-white hover:bg-opacity-10 p-2 rounded transition-all duration-200"
                          >
                            <div className="text-primary-white font-medium">
                              {machine.name}
                            </div>
                            <div className="text-sm text-primary-white opacity-70">
                              Floor {machine.floor} • ({machine.x}, {machine.y})
                            </div>
                          </button>
                          <div className={`w-3 h-3 rounded-full ml-2 ${
                            machine.in_use ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
