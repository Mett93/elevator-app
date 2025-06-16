// Types
export interface ElevatorCall {
  floor: number;
  direction: "up" | "down";
  timestamp: number;
}

export interface Elevator {
  id: number;
  currentFloor: number;
  targetFloor: number;
  direction: "up" | "down" | "idle";
  status: "moving" | "loading" | "idle";
  passengers: number[]; // destination floors
  lastMoved: number;
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: "call" | "movement" | "pickup" | "dropoff" | "system";
}
