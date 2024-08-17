import { Dispatch, SetStateAction } from 'react';

import { levels } from '@/config/levels';
import { board } from '@/core/engine';

import BoardSquare from './BoardSquare';
import { HouseCoordinatesMap } from './GameEngine';
import House from './House/House';
import { PigModel } from './PigModel';

type Props = {
  currentLevel: number;
};

export type BoardSquareCoordinates = {
  col: number;
  row: number;
  vector: THREE.Vector3Tuple;
};

export default function Board({ currentLevel }: Props) {
  const gameBoard: React.ReactNode[] = [];
  const squareColor = '#00e5ff';
  const squaresCoordinates: BoardSquareCoordinates[] = [];
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
        <PigModel
          key={`${pigPosition[0]}-${pigPosition[2]}`}
          position={pigPosition}
        />
      ))}

      <House
        id="red"
        // using key prop to force react re mount our House on level change
        key={`red-${currentLevel}`}
        position={[-5, 0.1, 0]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[
          [1, 2],
          [0, 1],
          [0, 1],
        ]}
      />
      <House
        id="yellow"
        key={`yellow-${currentLevel}`}
        position={[5, 0.1, 0]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[
          [1, 2],
          [0, 1],
        ]}
        wallColor="#ffeb3b"
      />
      <House
        id="brown"
        key={`brown-${currentLevel}`}
        position={[3, 0.1, -2.5]}
        boardSquaresCoordinates={squaresCoordinates}
        shape={[[1, 2, 1]]}
        wallColor="#6d4c41"
      />
    </>
  );
}
