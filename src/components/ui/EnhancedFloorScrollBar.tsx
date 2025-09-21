'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedFloorScrollBarProps {
  totalFloors: number;
  currentFloor?: number;
  onFloorSelect: (floorId: number) => void;
  isInDetailView: boolean;
  className?: string;
}

export const EnhancedFloorScrollBar = ({
  totalFloors,
  currentFloor,
  onFloorSelect,
  isInDetailView,
  className = ''
}: EnhancedFloorScrollBarProps) => {
  const floors = Array.from({ length: totalFloors }, (_, i) => i + 1);

  const handleDotClick = (floorId: number) => {
    if (!isInDetailView) {
      // If not in detail view, enter floor 5 first then navigate
      onFloorSelect(5);
      setTimeout(() => {
        if (floorId !== 5) {
          onFloorSelect(floorId);
        }
      }, 1200);
    } else {
      onFloorSelect(floorId);
    }
  };

  return (
    <div className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-20 ${className}`}>
      <div className="relative">
        {/* Oval Background */}
        <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm rounded-full w-12 h-48 flex items-center justify-center">
          <div className="w-1 h-40 bg-white bg-opacity-20 rounded-full" />
        </div>

        {/* Floor Dots */}
        <div className="relative flex flex-col items-center justify-center h-48 space-y-6 px-5">
          {floors.reverse().map((floorId) => { // Reverse to show floor 5 at top
            const isCurrentFloor = isInDetailView && currentFloor === floorId;
            const shouldHighlight = isInDetailView;
            
            return (
              <motion.button
                key={floorId}
                onClick={() => handleDotClick(floorId)}
                className="relative focus:outline-none"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Dot */}
                <motion.div
                  className={`rounded-full transition-all duration-300 ${
                    shouldHighlight
                      ? isCurrentFloor 
                        ? 'bg-white shadow-lg w-4 h-4' 
                        : 'bg-white bg-opacity-50 w-3 h-3'
                      : 'bg-white bg-opacity-30 w-2 h-2'
                  }`}
                  animate={{
                    scale: isCurrentFloor ? 1.3 : 1,
                    boxShadow: isCurrentFloor ? '0 0 12px rgba(255, 255, 255, 0.8)' : '0 0 0px rgba(255, 255, 255, 0)'
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                />

                {/* Floor Number Label */}
                <div className={`absolute -left-8 top-1/2 transform -translate-y-1/2 text-xs font-medium transition-all duration-300 ${
                  shouldHighlight
                    ? isCurrentFloor 
                      ? 'text-white opacity-100' 
                      : 'text-white opacity-70'
                    : 'text-white opacity-40'
                }`}>
                  {floorId}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
