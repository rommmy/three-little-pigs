import { Vector3Tuple } from 'three';

import { HouseCoordinatesMap, HouseIds } from '@/components/GameEngine';
import { levels } from '@/config/levels';

export const board = [
  [0, 1, 1, 0],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [0, 1, 1, 1],
];

export const validateLevel = (
  currentLevel: number,
  houseCoordinatesMap: HouseCoordinatesMap
) => {
  const levelConfig = levels[currentLevel];
  const validatedHouses = [];

  if (levelConfig == null) {
    throw new Error('levelConfig cannot be null');
  }

  if (houseCoordinatesMap == null) {
    console.debug('[GameEngine] No house placed on the board');
    return;
  }

  for (const [houseId, position] of Object.entries(houseCoordinatesMap)) {
    const houseExpectedPosition = levelConfig.outcome[houseId as HouseIds];

    if (Array.isArray(houseExpectedPosition[0])) {
      // Since houses can rotate, we can have different matching vectors
      (houseExpectedPosition as Vector3Tuple[]).forEach(
        (houseExpectedPosition) =>
          houseExpectedPosition[0] == position[0] &&
          houseExpectedPosition[2] == position[2]
            ? validatedHouses.push(houseId)
            : ''
      );
    } else {
      if (
        houseExpectedPosition[0] == position[0] &&
        houseExpectedPosition[2] == position[2]
      ) {
        validatedHouses.push(houseId);
      }
    }
  }

  if (
    validatedHouses.includes('red') &&
    validatedHouses.includes('yellow') &&
    validatedHouses.includes('brown')
  ) {
    console.debug('LEVEL COMPLETED!');
    return true;
  }

  return false;
};
