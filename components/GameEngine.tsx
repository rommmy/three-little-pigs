import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Vector3Tuple } from 'three';

import { levels } from '@/config/levels';
import { useCameraContext } from '@/context/camera-context';

import Board from './Board';
import CameraLight from './CameraLight';

export type HouseIds = 'red' | 'yellow' | 'brown';
export type HouseCoordinatesMap = Record<HouseIds, THREE.Vector3Tuple> | null;

export default function GameEngine() {
  const { camera } = useThree();
  const { orbitControlsEnabled } = useCameraContext();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [houseCoordinatesMap, setHouseCoordinatesMap] =
    useState<HouseCoordinatesMap>(null);

  const validateCurrentLevel = () => {
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
          console.debug(`${houseId} correctly placed`);
        }
      }
    }

    if (
      validatedHouses.includes('red') &&
      validatedHouses.includes('yellow') &&
      validatedHouses.includes('brown')
    ) {
      console.debug('LEVEL COMPLETED!');
    }
  };

  useEffect(() => {
    camera.position.set(1, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    validateCurrentLevel();
  }, [houseCoordinatesMap]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <CameraLight />
      <Board
        setHouseCoordinatesMap={setHouseCoordinatesMap}
        currentLevel={currentLevel}
      />

      <OrbitControls enabled={orbitControlsEnabled} />
      <axesHelper args={[5]} />
    </>
  );
}
