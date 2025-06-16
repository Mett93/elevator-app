import type { LogEntry } from "../../types/ElevatorControlSystem";

interface SystemLogsProps {
  logs: LogEntry[];
}
export const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">System Logs</h2>
      <div className="bg-black text-green-400 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <p>System ready. Press "Start System" to begin.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`ml-2 ${
                  log.type === "call"
                    ? "text-yellow-400"
                    : log.type === "movement"
                    ? "text-blue-400"
                    : log.type === "pickup"
                    ? "text-green-400"
                    : log.type === "dropoff"
                    ? "text-purple-400"
                    : "text-green-400"
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
};
