import { useEffect } from 'react';

import { validateLevel } from '@/core/engine';
import { useGameStore } from '@/core/store';

import Board from './Board';
import Lights from './Lights';
import Orbital from './Orbital';

export type HouseIds = 'red' | 'yellow' | 'brown';
export type HouseCoordinatesMap = Partial<
  Record<HouseIds, THREE.Vector3Tuple>
> | null;

export default function GameEngine() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setCurrentLevelCompleted = useGameStore(
    (state) => state.setCurrentLevelCompleted
  );
  const houseCoordinatesMap = useGameStore(
    (state) => state.houseCoordinatesMap
  );

  useEffect(() => {
    if (houseCoordinatesMap != null) {
      const isLevelValid = validateLevel(currentLevel, houseCoordinatesMap);

      if (isLevelValid) {
        setCurrentLevelCompleted();
      }
    }
  }, [houseCoordinatesMap]);

  return (
    <>
      <Lights />
      <Orbital />
      <Board currentLevel={currentLevel} />
      {/*<axesHelper args={[5]} />*/}
    </>
  );
}
