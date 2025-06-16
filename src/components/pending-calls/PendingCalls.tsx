import { ArrowDown, ArrowUp } from "lucide-react";
import type { ElevatorCall } from "../../types/ElevatorControlSystem";

interface PendingCallsProps {
  calls: ElevatorCall[];
}
export const PendingCalls: React.FC<PendingCallsProps> = ({ calls }) => {
  return (
    <>
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">
          Pending Calls ({calls.length})
        </h2>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {calls.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending calls</p>
          ) : (
            calls.map((call, index) => (
              <div
                key={index}
                className="bg-white rounded p-2 text-sm flex items-center gap-2"
              >
                {call.direction === "up" ? (
                  <ArrowUp size={16} className="text-green-600" />
                ) : (
                  <ArrowDown size={16} className="text-red-600" />
                )}
                <span>
                  Floor {call.floor} - {call.direction.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
