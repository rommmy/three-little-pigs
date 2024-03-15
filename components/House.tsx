import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Vector3Tuple } from 'three';
import * as THREE from 'three';

import { fromVectorToGrid, levels } from '@/config/levels';
import { useCameraContext } from '@/context/camera-context';
import { useGameContext } from '@/context/game-context';

import { BoardSquareCoordinates, board } from './Board';
import { HouseCoordinatesMap } from './GameEngine';

type Props = {
  id: string;
  position: Vector3Tuple;
  shape: number[][];
  wallColor?: string;
  boardSquaresCoordinates: BoardSquareCoordinates[];
  setHouseCoordinatesMap: Dispatch<SetStateAction<HouseCoordinatesMap>>;
  currentLevel: number;
};

const WALL_HEIGHT = 1;
const WALL_THICKNESS = 0.1;
const WINDOW_SIZE = 0.3;

const WallWithWindow = ({
  position,
  color = '#e53935',
}: {
  position: Vector3Tuple;
  color: string;
}) => {
  const extrudeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Define the outer shape (the wall)
    shape.moveTo(-0.5, 0); // Bottom-left corner
    shape.lineTo(-0.5, WALL_HEIGHT); // Top-left corner
    shape.lineTo(0.5, WALL_HEIGHT); // Top-right corner
    shape.lineTo(0.5, 0); // Bottom-right corner
    shape.closePath();

    // Define the window hole
    const windowSize = 0.3;
    const windowStart = (WALL_HEIGHT - windowSize) / 2;
    const hole = new THREE.Path();
    hole.moveTo(windowStart - 0.5, windowStart);
    hole.lineTo(windowStart - 0.5, windowStart + windowSize);
    hole.lineTo(windowStart - 0.5 + windowSize, windowStart + windowSize);
    hole.lineTo(windowStart - 0.5 + windowSize, windowStart);
    hole.closePath();

    shape.holes.push(hole);

    const extrudeSettings = {
      steps: 2,
      depth: 0.1, // Wall thickness
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <mesh
      position={[position[0], position[1] - 0.05, position[2]]}
      geometry={extrudeGeometry}
    >
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default function House({
  id,
  position,
  shape,
  boardSquaresCoordinates,
  setHouseCoordinatesMap,
  currentLevel,
  wallColor = '#e53935',
}: Props) {
  const { toggleOrbitControls, orbitControlsEnabled } = useCameraContext();
  // const { currentLevel, houseCoordinatesMap, setHouseCoordinatesMap } =
  //   useGameContext();
  const houseRef = useRef<THREE.Group>(null);
  const { gl, camera } = useThree();
  const mouse = new THREE.Vector2();
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [dragPlane] = useState(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  );
  const [initialIntersect, setInitialIntersect] = useState(new THREE.Vector3());
  const [initialPosition, setInitialPosition] = useState(new THREE.Vector3());

  const handlePointerDown = (event: ThreeEvent<MouseEvent>) => {
    toggleOrbitControls(false);
    setIsDragging(true);

    // Calculate initial intersect point
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const ray = raycaster.ray;
    ray.intersectPlane(dragPlane, initialIntersect);
    setInitialIntersect(initialIntersect.clone());

    // Store initial position of the object
    if (houseRef.current) {
      setInitialPosition(houseRef.current.position.clone());
    }

    event.stopPropagation();
  };

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
            // console.debug(
            //   `matching pig[${pigPositionToGrid.row}][${pigPositionToGrid.col}] with [${rowIndexAfterRotation}][${colIndexAfterRotation}]`
            // );
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

    const position = houseRef.current.position;
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

      houseRef.current.position.copy(
        new THREE.Vector3(
          closeEnoughMatch.vector[0],
          0.1,
          closeEnoughMatch.vector[2]
        )
      );

      setHouseCoordinatesMap((prev) =>
        prev
          ? { ...prev, [id]: closeEnoughMatch.vector }
          : ({
              [id]: closeEnoughMatch.vector,
            } as unknown as HouseCoordinatesMap)
      );
    }
  };

  const handlePointerUp = (event: ThreeEvent<MouseEvent>) => {
    setIsDragging(false);
    toggleOrbitControls(true);

    if (hasMoved) {
      closeEnoughCheck();
    }

    // setTimeout to let the onClick logic (rotateHouse) apply if intended
    setTimeout(() => setHasMoved(false));
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging || houseRef.current == null) {
      return;
    }

    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Use a Ray to find intersection with the plane
    const ray = raycaster.ray;
    const intersection = new THREE.Vector3();
    ray.intersectPlane(dragPlane, intersection);

    if (intersection) {
      const delta = intersection.sub(initialIntersect);

      if (delta.length() > 0.005) {
        //TODO: extract this in constant
        setHasMoved(true);
      }

      houseRef.current.position.copy(initialPosition.clone().add(delta));
    }
  };

  const rotateHouse = (event: ThreeEvent<MouseEvent>) => {
    if (hasMoved || houseRef.current == null) {
      // drag action, ignore it
      return;
    }

    const increment = 90;

    const currentRotation = THREE.MathUtils.radToDeg(
      houseRef.current.rotation.y
    );
    const newRotation = (currentRotation + increment) % 360;

    houseRef.current.rotation.y = THREE.MathUtils.degToRad(newRotation);

    setCurrentRotation(newRotation);

    // prevent bubbling if event originates from a house wall
    event.stopPropagation();
  };

  useEffect(() => {
    // Check if rotation change produced valid move
    closeEnoughCheck();
  }, [currentRotation]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <group
      position={position}
      ref={houseRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={rotateHouse}
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
                <group position={[0, WALL_HEIGHT / 2 + WALL_THICKNESS / 2, 0]}>
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
    </group>
  );
}
