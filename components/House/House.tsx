import { DragControls, useTexture } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { fromVectorToGrid, levels } from '@/config/levels';
import { board } from '@/core/engine';
import { useGameStore } from '@/core/store';

import { BoardSquareCoordinates } from '../Board';
import { HouseIds } from '../GameEngine';
import WallWithWindow from './WallWithWindow';

type Props = {
  id: string;
  position: THREE.Vector3Tuple;
  shape: number[][];
  wallColor?: string;
  boardSquaresCoordinates: BoardSquareCoordinates[];
};

export const WALL_HEIGHT = 1;
const WALL_THICKNESS = 0.1;

export default function House({
  id,
  position,
  shape,
  boardSquaresCoordinates,
  wallColor = '#e53935',
}: Props) {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setIsOrbitControlEnabled = useGameStore(
    (state) => state.setIsOrbitControlEnabled
  );
  const setHouseCoordinatesMap = useGameStore(
    (state) => state.setHouseCoordinatesMap
  );
  const houseRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);

  /**
   * Checks if the house is still in the bounds and that it does
   * not overlap with a pig on any side
   */
  const isMoveLegal = (startRow: number, startCol: number) => {
    let outOfBounds = false;
    let pigOverlap = false;
    const pigsPositions = levels[currentLevel].pigs;

    shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 1 || col === 2) {
          let rowIndexAfterRotation = 0;
          let colIndexAfterRotation = 0;

          switch (currentRotation) {
            case 0:
              rowIndexAfterRotation = startRow + rowIndex;
              colIndexAfterRotation = startCol + colIndex;
              break;
            case 90:
              rowIndexAfterRotation = startRow - colIndex;
              colIndexAfterRotation = startCol + rowIndex;
              break;
            case 180:
              rowIndexAfterRotation = startRow - rowIndex;
              colIndexAfterRotation = startCol - colIndex;
              break;
            case 270:
              rowIndexAfterRotation = startRow + colIndex;
              colIndexAfterRotation = startCol - rowIndex;
              break;
            default:
              break;
          }

          if (
            rowIndexAfterRotation > 3 ||
            colIndexAfterRotation > 3 ||
            board[rowIndexAfterRotation][colIndexAfterRotation] === 0
          ) {
            //@TODO: add BOARD_SIZE constant
            console.debug(
              `Out of bounds at [${rowIndexAfterRotation}][${colIndexAfterRotation}]`
            );
            outOfBounds = true;
          }

          // Check for pig overlap
          // NB: In the current mode implemented (without the wolf), the pigs
          // MUST be left out of the house.
          // @TODO: When implementing the wolf, add check on col === 1 here before.
          pigsPositions.forEach((pigPosition) => {
            const pigPositionToGrid = fromVectorToGrid(pigPosition);

            if (
              pigPositionToGrid.row === rowIndexAfterRotation &&
              pigPositionToGrid.col === colIndexAfterRotation
            ) {
              console.debug(
                `Pig overlap at [${pigPositionToGrid.row}][${pigPositionToGrid.col}]`
              );
              pigOverlap = true;
            }
          });
        }
      });
    });

    // console.debug('out of bounds', outOfBounds);
    // console.debug('pigOverlap', pigOverlap);
    return outOfBounds === false && pigOverlap === false;
  };

  /**
   * Checks if the house has been dropped close enough to squares
   */
  const closeEnoughCheck = () => {
    if (houseRef.current == null) {
      return;
    }

    const position = new THREE.Vector3();

    houseRef.current.matrixWorld.decompose(
      position,
      new THREE.Quaternion(),
      new THREE.Vector3()
    );

    const closeEnoughMatch = boardSquaresCoordinates.find((coo) => {
      const xThresold = 0.15;
      const zThresold = 0.15;
      if (
        position.x >= coo.vector[0] - xThresold &&
        position.x <= coo.vector[0] + xThresold &&
        position.z >= coo.vector[2] - zThresold &&
        position.z <= coo.vector[2] + zThresold
      ) {
        return true;
      }
    });

    if (
      closeEnoughMatch &&
      isMoveLegal(closeEnoughMatch.row, closeEnoughMatch.col)
    ) {
      console.debug('CLOSE ENOUGH MATCH FOUND', closeEnoughMatch.vector);

      if (houseRef.current.parent) {
        houseRef.current.parent.updateMatrixWorld(true); // Ensure the parent's world matrix is up to date

        const inverseParentMatrixWorld = new THREE.Matrix4()
          .copy(houseRef.current.parent.matrixWorld)
          .invert();
        const localPosition = new THREE.Vector3(
          closeEnoughMatch.vector[0],
          0.1,
          closeEnoughMatch.vector[2]
        ).applyMatrix4(inverseParentMatrixWorld);

        houseRef.current.position.copy(localPosition);

        // Since we're manually setting the position, let's ensure the object's matrix is updated
        houseRef.current.updateMatrix();
      }

      setHouseCoordinatesMap({
        [id]: closeEnoughMatch.vector,
      });
    }
  };

  const rotateHouse = (event: ThreeEvent<MouseEvent>) => {
    if (isDragging || houseRef.current == null) {
      return;
    }

    const increment = 90;

    const currentRotation = THREE.MathUtils.radToDeg(
      houseRef.current.rotation.y
    );
    const newRotation = (currentRotation + increment) % 360;

    houseRef.current.rotation.y = THREE.MathUtils.degToRad(newRotation);
    houseRef.current.updateMatrix();
    houseRef.current.updateMatrixWorld();

    setCurrentRotation(newRotation);

    // prevent bubbling if event originates from a house wall
    event.stopPropagation();
  };

  useEffect(() => {
    // Check if rotation change produced valid move
    closeEnoughCheck();
  }, [currentRotation]);

  console.debug(`rendering house ${id} ${position}`);

  return (
    <group
      position={position}
      onPointerDown={() => setIsOrbitControlEnabled(false)}
      onPointerUp={() => {
        setIsOrbitControlEnabled(true);
      }}
      onClick={rotateHouse}
    >
      <DragControls
        axisLock="y"
        ref={houseRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          closeEnoughCheck();
        }}
      >
        {shape.map((row, rowIndex) => {
          return row.map((col, colIndex) => {
            if (col === 1) {
              return (
                <mesh
                  key={`f-${rowIndex}-${colIndex}`}
                  position={[colIndex, 0, rowIndex]}
                >
                  <boxGeometry args={[1, WALL_THICKNESS, 1]} />
                  <meshStandardMaterial color="#8bc34a" />
                </mesh>
              );
            }

            if (col === 2) {
              return (
                <group
                  key={`h-${rowIndex}-${colIndex}`}
                  position={[colIndex, 0, rowIndex]}
                >
                  {/* Foundation */}
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1, WALL_THICKNESS, 1]} />
                    <meshStandardMaterial color="#8bc34a" />
                  </mesh>
                  {/* Walls */}
                  <WallWithWindow
                    position={[0, WALL_THICKNESS, 0.4]}
                    color={wallColor}
                  />
                  <group
                    position={[0, WALL_HEIGHT / 2 + WALL_THICKNESS / 2, 0]}
                  >
                    <mesh position={[0, 0, -0.45]}>
                      <boxGeometry args={[1, WALL_HEIGHT, WALL_THICKNESS]} />
                      <meshStandardMaterial color={wallColor} />
                    </mesh>
                    <mesh position={[0.45, 0, 0]}>
                      <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, 1]} />
                      <meshStandardMaterial color={wallColor} />
                    </mesh>
                    <mesh position={[-0.45, 0, 0]}>
                      <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, 1]} />
                      <meshStandardMaterial color={wallColor} />
                    </mesh>
                  </group>
                </group>
              );
            }
          });
        })}
      </DragControls>
    </group>
  );
}
