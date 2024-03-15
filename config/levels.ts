import { HouseIds } from '@/context/game-context';

type LevelOutcome = Record<HouseIds, THREE.Vector3Tuple | THREE.Vector3Tuple[]>;
export type Level = { pigs: THREE.Vector3Tuple[]; outcome: LevelOutcome };

// translates grid coordinates to vector coordinates
const fromGridToVector = (row: number, col: number): THREE.Vector3Tuple => {
  /* Position the sphere at {row}{col}, centered in the recessed area */
  /* Adjusted Y-coordinate to account for the elevation of the recessed area and the radius of the sphere */
  return [col - 1.5, 0.3 + 0.05, row - 1.5];
};

export const fromVectorToGrid = (
  vector: THREE.Vector3Tuple
): { row: number; col: number } => {
  return { row: vector[2] + 1.5, col: vector[0] + 1.5 };
};

export const levels: Record<number, Level> = {
  1: {
    pigs: [
      fromGridToVector(2, 0),
      fromGridToVector(2, 2),
      fromGridToVector(3, 2),
    ],
    outcome: {
      red: [-1.5, 0, -0.5],
      yellow: [-0.5, 0, -1.5],
      brown: [
        [1.5, 0, -0.5],
        [1.5, 0, 1.5],
      ],
    },
  },
};
