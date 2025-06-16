interface ActionsProps {
  isRunning: boolean;
  startSystem: () => void;
  stopSystem: () => void;
}
export const Actions: React.FC<ActionsProps> = ({
  isRunning,
  startSystem,
  stopSystem,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={startSystem}
        disabled={isRunning}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Start System
      </button>
      <button
        onClick={stopSystem}
        disabled={!isRunning}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Stop System
      </button>
    </div>
  );
};
