import { Dispatch, SetStateAction } from 'react';

import { levels } from '@/config/levels';

// import { useGameContext } from '@/context/game-context';
import BoardSquare from './BoardSquare';
import { HouseCoordinatesMap } from './GameEngine';
import House from './House';
import Pig from './Pig';

export const board = [
  [0, 1, 1, 0],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [0, 1, 1, 1],
];

type Props = {
  setHouseCoordinatesMap: Dispatch<SetStateAction<HouseCoordinatesMap>>;
  currentLevel: number;
};

export type BoardSquareCoordinates = {
  col: number;
  row: number;
  vector: THREE.Vector3Tuple;
};

export default function Board({ currentLevel, setHouseCoordinatesMap }: Props) {
  const gameBoard: React.ReactNode[] = [];
  const size = 4;
  const squareColor = '#00e5ff';
  const squaresCoordinates: BoardSquareCoordinates[] = [];
  // const { currentLevel } = useGameContext();
  const level = levels[currentLevel];

  if (level == null) {
    throw new Error('level cannot be null');
  }

  board.map((row, rowIndex) => {
    row.map((col, colIndex) => {
      if (col === 1) {
        squaresCoordinates.push({
          row: rowIndex,
          col: colIndex,
          vector: [colIndex - 1.5, 0, rowIndex - 1.5],
        });
        gameBoard.push(
          <BoardSquare
            key={`${rowIndex}-${colIndex}`}
            position={[colIndex - 1.5, 0, rowIndex - 1.5]}
            color={squareColor}
          />
        );
      }
    });
  });

  return (
    <>
      <group>{gameBoard}</group>
      {level.pigs.map((pigPosition) => (
        <Pig
          key={`${pigPosition[0]}-${pigPosition[2]}`}
          position={pigPosition}
        />
      ))}
      <House
        id="red"
        position={[-5, 0.1, 0]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[
          [1, 2],
          [0, 1],
          [0, 1],
        ]}
        setHouseCoordinatesMap={setHouseCoordinatesMap}
        currentLevel={currentLevel}
      />
      <House
        id="yellow"
        position={[5, 0.1, 0]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[
          [1, 2],
          [0, 1],
        ]}
        wallColor="#ffeb3b"
        setHouseCoordinatesMap={setHouseCoordinatesMap}
        currentLevel={currentLevel}
      />
      <House
        id="brown"
        position={[3, 0.1, -2.5]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[[1, 2, 1]]}
        wallColor="#6d4c41"
        setHouseCoordinatesMap={setHouseCoordinatesMap}
        currentLevel={currentLevel}
      />
    </>
  );
}
