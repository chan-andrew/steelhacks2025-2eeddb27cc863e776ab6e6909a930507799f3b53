// MongoDB Machine format
export interface Machine {
  _id: string;
  id: number;
  name: string;
  floor: number;
  in_use: boolean;
  x: number;
  y: number;
  muscles: string[];
  // 3D rendering properties (calculated)
  position?: [number, number, number];
  rotation?: [number, number, number];
  dimensions?: [number, number, number];
}

export interface GymFloor {
  id: number;
  name: string;
  level: number; // 1-5 for the 5 floors
  machines: Machine[];
  color: string;
  opacity: number;
  isSelected: boolean;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ViewMode {
  type: 'overview' | 'floor-detail';
  selectedFloor?: number;
  cameraState: CameraState;
}

export interface GymState {
  floors: GymFloor[];
  currentView: ViewMode;
  isTransitioning: boolean;
  selectedMachine?: string;
  filteredMuscleGroup?: string;
  currentPosition?: { floor: number; x: number; y: number };
}

export interface TouchGesture {
  type: 'tap' | 'pinch' | 'pan';
  position: [number, number];
  delta?: [number, number];
  scale?: number;
}

export interface FloorConfig {
  spacing: number; // vertical spacing between floors
  baseHeight: number; // height of each floor
  width: number; // floor width
  depth: number; // floor depth
}

export interface MuscleGroup {
  name: string;
  machines: Machine[];
  availableCount: number;
}

// Real-time update message type
export interface MachineUpdateMessage {
  _id: {
    _data: string;
  };
  operationType: 'update';
  clusterTime: {
    $timestamp: string;
  };
  wallTime: string;
  ns: {
    db: string;
    coll: string;
  };
  documentKey: {
    _id: string;
  };
  updateDescription: {
    updatedFields: {
      in_use?: boolean;
    };
    removedFields: string[];
    truncatedArrays: unknown[];
  };
}
