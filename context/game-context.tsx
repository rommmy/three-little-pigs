import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

export type Game = {
  currentLevel: number;
  setHouseCoordinatesMap: Dispatch<SetStateAction<HouseCoordinatesMap>>;
  houseCoordinatesMap: HouseCoordinatesMap;
};

export const GameContext = createContext<Game>({
  currentLevel: 1,
  setHouseCoordinatesMap: () => '',
  houseCoordinatesMap: null,
});

type GameContextProviderProps = { children?: React.ReactNode };
export type HouseIds = 'red' | 'yellow' | 'brown';
type HouseCoordinatesMap = Record<HouseIds, THREE.Vector3Tuple> | null;

export const GameContextProvider = ({ children }: GameContextProviderProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [houseCoordinatesMap, setHouseCoordinatesMap] =
    useState<HouseCoordinatesMap>(null);

  return (
    <GameContext.Provider
      value={{ currentLevel, setHouseCoordinatesMap, houseCoordinatesMap }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGameContext(): Game {
  return useContext(GameContext);
}
