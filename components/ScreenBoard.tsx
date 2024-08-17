import { useGameStore } from '@/core/store';

export default function ScreenBoard() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const isCurrentLevelCompleted = useGameStore(
    (state) => state.isCurrentLevelCompleted
  );
  const goToNextLevel = useGameStore((state) => state.goToNextLevel);

  return (
    <div className="p-12 absolute z-50">
      <div>Current level : {currentLevel}</div>
      <div className={isCurrentLevelCompleted ? 'text-green' : 'text-red'}>
        Current level completed : {isCurrentLevelCompleted ? 'Yes' : 'No'}
      </div>
      {isCurrentLevelCompleted && (
        <button
          className="bg-green-500 py-1 px-2 rounded-lg"
          onClick={goToNextLevel}
        >
          Go to next level
        </button>
      )}
    </div>
  );
}
