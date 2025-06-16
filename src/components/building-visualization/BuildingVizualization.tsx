import { ArrowDown, ArrowUp } from "lucide-react";
import { FLOORS } from "../../constants/ElevatorControlSystem";
import type { Elevator, ElevatorCall } from "../../types/ElevatorControlSystem";

interface BuildingVizualizationProps {
  elevators: Elevator[];
  calls: ElevatorCall[];
  manualCall: (floor: number, direction: "up" | "down") => void;
}
export const BuildingVizualization: React.FC<BuildingVizualizationProps> = ({
  elevators,
  calls,
  manualCall,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Building Layout</h2>
      <div className="space-y-2">
        {Array.from({ length: FLOORS }, (_, i) => FLOORS - i).map((floor) => (
          <div
            key={floor}
            className="flex items-center gap-4 p-2 bg-white rounded border"
          >
            <div className="w-8 text-center font-semibold">F{floor}</div>

            {/* Elevator positions */}
            <div className="flex gap-1 flex-1">
              {elevators.map((elevator) => (
                <div
                  key={elevator.id}
                  className={`w-12 h-8 rounded text-xs flex items-center justify-center font-semibold transition-all duration-300 ${
                    elevator.currentFloor === floor
                      ? elevator.status === "loading"
                        ? "bg-yellow-500 text-white"
                        : elevator.status === "moving"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {elevator.currentFloor === floor ? `E${elevator.id}` : ""}
                </div>
              ))}
            </div>

            {/* Call buttons */}
            <div className="flex gap-1">
              {floor < FLOORS && (
                <button
                  disabled
                  onClick={() => manualCall(floor, "up")}
                  className={`p-1 rounded ${
                    calls.some(
                      (call) => call.floor === floor && call.direction === "up"
                    )
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              )}
              {floor > 1 && (
                <button
                  disabled
                  onClick={() => manualCall(floor, "down")}
                  className={`p-1 rounded ${
                    calls.some(
                      (call) =>
                        call.floor === floor && call.direction === "down"
                    )
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  <ArrowDown size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
