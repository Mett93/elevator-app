import React, { useState, useEffect, useCallback } from "react";
import { Actions } from "../components/actions/Actions";
import type {
  Elevator,
  ElevatorCall,
  LogEntry,
} from "../types/ElevatorControlSystem";
import { SystemLogs } from "../components/system-logs/SystemLogs";
import {
  DOOR_TIME,
  ELEVATOR_COUNT,
  FLOOR_TRAVEL_TIME,
  FLOORS,
} from "../constants/ElevatorControlSystem";
import { BuildingVizualization } from "../components/building-visualization/BuildingVizualization";
import { ElevatorStatus } from "../components/elevator-status/ElevatorStatus";
import { PendingCalls } from "../components/pending-calls/PendingCalls";

const ElevatorControlSystem: React.FC = () => {
  const [elevators, setElevators] = useState<Elevator[]>(() =>
    Array.from({ length: ELEVATOR_COUNT }, (_, i) => ({
      id: i + 1,
      currentFloor: 1,
      targetFloor: 1,
      direction: "idle" as const,
      status: "idle" as const,
      passengers: [],
      lastMoved: Date.now(),
    }))
  );

  const [calls, setCalls] = useState<ElevatorCall[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoCallInterval, setAutoCallInterval] = useState<number | null>(null);

  const addLog = useCallback(
    (message: string, type: LogEntry["type"] = "system") => {
      setLogs((prev) =>
        [
          {
            timestamp: Date.now(),
            message,
            type,
          },
          ...prev,
        ].slice(0, 50)
      ); // Keep last 50 logs
    },
    []
  );

  // Generate random elevator calls
  const generateRandomCall = useCallback(() => {
    const floor = Math.floor(Math.random() * FLOORS) + 1;
    const direction = Math.random() > 0.5 ? "up" : "down";

    // Adjust direction based on floor constraints
    const finalDirection =
      floor === 1 ? "up" : floor === FLOORS ? "down" : direction;

    const newCall: ElevatorCall = {
      floor,
      direction: finalDirection,
      timestamp: Date.now(),
    };

    setCalls((prev) => {
      // Avoid duplicate calls
      const exists = prev.some(
        (call) => call.floor === floor && call.direction === finalDirection
      );
      if (!exists) {
        addLog(
          `${finalDirection.toUpperCase()} call received on floor ${floor}`,
          "call"
        );
        return [...prev, newCall];
      }
      return prev;
    });
  }, [addLog]);

  // Find best elevator for a call
  const findBestElevator = useCallback(
    (call: ElevatorCall): Elevator | null => {
      const availableElevators = elevators.filter((elevator) => {
        // Elevator is idle or moving in same direction and can pick up the call
        if (elevator.status === "idle") return true;

        if (elevator.direction === call.direction) {
          if (call.direction === "up" && elevator.currentFloor <= call.floor)
            return true;
          if (call.direction === "down" && elevator.currentFloor >= call.floor)
            return true;
        }

        return false;
      });

      if (availableElevators.length === 0) return null;

      // Find closest elevator
      return availableElevators.reduce((closest, current) => {
        const closestDistance = Math.abs(closest.currentFloor - call.floor);
        const currentDistance = Math.abs(current.currentFloor - call.floor);
        return currentDistance < closestDistance ? current : closest;
      });
    },
    [elevators]
  );

  // Assign calls to elevators
  const assignCalls = useCallback(() => {
    setCalls((prevCalls) => {
      const remainingCalls: ElevatorCall[] = [];

      prevCalls.forEach((call) => {
        const bestElevator = findBestElevator(call);
        if (bestElevator) {
          setElevators((prev) =>
            prev.map((elevator) => {
              if (elevator.id === bestElevator.id) {
                const newTargetFloor = call.floor;
                if (elevator.status === "idle") {
                  addLog(
                    `Elevator ${elevator.id} assigned to floor ${call.floor}`,
                    "movement"
                  );
                  return {
                    ...elevator,
                    targetFloor: newTargetFloor,
                    direction:
                      elevator.currentFloor < newTargetFloor
                        ? "up"
                        : elevator.currentFloor > newTargetFloor
                        ? "down"
                        : "idle",
                    status:
                      elevator.currentFloor === newTargetFloor
                        ? "loading"
                        : "moving",
                  };
                } else {
                  // Add to passenger list if not already there
                  if (!elevator.passengers.includes(newTargetFloor)) {
                    return {
                      ...elevator,
                      passengers: [...elevator.passengers, newTargetFloor].sort(
                        (a, b) => (elevator.direction === "up" ? a - b : b - a)
                      ),
                    };
                  }
                }
              }
              return elevator;
            })
          );
        } else {
          remainingCalls.push(call);
        }
      });

      return remainingCalls;
    });
  }, [findBestElevator, addLog]);

  // Move elevators
  const moveElevators = useCallback(() => {
    const now = Date.now();

    setElevators((prev) =>
      prev.map((elevator) => {
        if (elevator.status === "loading") {
          // Check if loading time is complete
          if (now - elevator.lastMoved >= DOOR_TIME) {
            // Determine next target
            let nextTarget = elevator.targetFloor;
            if (elevator.passengers.length > 0) {
              nextTarget = elevator.passengers[0];
            }

            const newDirection =
              elevator.currentFloor < nextTarget
                ? "up"
                : elevator.currentFloor > nextTarget
                ? "down"
                : "idle";

            return {
              ...elevator,
              targetFloor: nextTarget,
              direction: newDirection,
              status: elevator.currentFloor === nextTarget ? "idle" : "moving",
              lastMoved: now,
            };
          }
          return elevator;
        }

        if (
          elevator.status === "moving" &&
          now - elevator.lastMoved >= FLOOR_TRAVEL_TIME
        ) {
          const newFloor =
            elevator.direction === "up"
              ? Math.min(elevator.currentFloor + 1, FLOORS)
              : Math.max(elevator.currentFloor - 1, 1);

          // Check if we need to stop at this floor
          const shouldStop =
            newFloor === elevator.targetFloor ||
            elevator.passengers.includes(newFloor);

          if (shouldStop) {
            // Remove passenger destinations if we're dropping off
            const remainingPassengers = elevator.passengers.filter(
              (floor) => floor !== newFloor
            );

            if (elevator.passengers.includes(newFloor)) {
              addLog(
                `Elevator ${elevator.id} dropped off passengers at floor ${newFloor}`,
                "dropoff"
              );
            }

            if (newFloor === elevator.targetFloor) {
              addLog(
                `Elevator ${elevator.id} picked up passengers at floor ${newFloor}`,
                "pickup"
              );
            }

            // Determine next target
            let nextTarget = newFloor;
            if (remainingPassengers.length > 0) {
              nextTarget = remainingPassengers[0];
            }

            const newDirection =
              newFloor < nextTarget
                ? "up"
                : newFloor > nextTarget
                ? "down"
                : "idle";

            return {
              ...elevator,
              currentFloor: newFloor,
              targetFloor: nextTarget,
              direction: newDirection,
              status: "loading",
              passengers: remainingPassengers,
              lastMoved: now,
            };
          } else {
            // Just move to next floor
            addLog(
              `Elevator ${elevator.id} moving ${elevator.direction} to floor ${newFloor}`,
              "movement"
            );
            return {
              ...elevator,
              currentFloor: newFloor,
              lastMoved: now,
            };
          }
        }

        return elevator;
      })
    );
  }, [addLog]);

  // Main control loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      assignCalls();
      moveElevators();
    }, 100); // Check every 100ms for smooth movement

    return () => clearInterval(interval);
  }, [isRunning, assignCalls, moveElevators]);

  // Auto-generate calls
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(
        generateRandomCall,
        Math.random() * 15000 + 5000
      ); // 5-20 seconds
      setAutoCallInterval(interval);
      return () => clearInterval(interval);
    } else if (autoCallInterval) {
      clearInterval(autoCallInterval);
      setAutoCallInterval(null);
    }
  }, [isRunning, generateRandomCall]);

  const startSystem = () => {
    setIsRunning(true);
    addLog("Elevator control system started", "system");
  };

  const stopSystem = () => {
    setIsRunning(false);
    addLog("Elevator control system stopped", "system");
  };

  const manualCall = (floor: number, direction: "up" | "down") => {
    const newCall: ElevatorCall = { floor, direction, timestamp: Date.now() };
    setCalls((prev) => {
      const exists = prev.some(
        (call) => call.floor === floor && call.direction === direction
      );
      if (!exists) {
        addLog(
          `Manual ${direction.toUpperCase()} call on floor ${floor}`,
          "call"
        );
        return [...prev, newCall];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Elevator Control System
          </h1>

          <div className="flex gap-4 mb-6">
            <Actions
              isRunning={isRunning}
              startSystem={startSystem}
              stopSystem={stopSystem}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Building Visualization */}

            <BuildingVizualization
              elevators={elevators}
              calls={calls}
              manualCall={manualCall}
            />

            <div className="space-y-4">
              {/* Elevator Status */}
              <ElevatorStatus elevators={elevators} />

              {/* Pending Calls */}
              <PendingCalls calls={calls} />
            </div>
          </div>

          {/* System Logs */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <SystemLogs logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevatorControlSystem;
