import type { Elevator } from "../../types/ElevatorControlSystem";

interface ElevatorStatusProps {
  elevators: Elevator[];
}
export const ElevatorStatus: React.FC<ElevatorStatusProps> = ({ elevators }) => {
  return (
    <>
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Elevator Status</h2>
        <div className="space-y-3">
          {elevators.map((elevator) => (
            <div
              key={elevator.id}
              className="bg-white rounded p-3 border-l-4"
              style={{
                borderLeftColor:
                  elevator.status === "idle"
                    ? "#6B7280"
                    : elevator.status === "loading"
                    ? "#F59E0B"
                    : "#3B82F6",
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">Elevator {elevator.id}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    elevator.status === "idle"
                      ? "bg-gray-200 text-gray-700"
                      : elevator.status === "loading"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {elevator.status.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Floor: {elevator.currentFloor} | Target: {elevator.targetFloor}{" "}
                | Direction: {elevator.direction.toUpperCase()}
                {elevator.passengers.length > 0 && (
                  <div className="mt-1">
                    Passengers going to: {elevator.passengers.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
