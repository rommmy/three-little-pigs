import { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';

import { HouseCoordinatesMap } from '@/components/GameEngine';

type Game = {
  currentLevel: number;
  isCurrentLevelCompleted: boolean;
  isOrbitControlEnabled: boolean;
  setCurrentLevelCompleted: () => void;
  goToNextLevel: () => void;
  setIsOrbitControlEnabled: (enabled: boolean) => void;
  setHouseCoordinatesMap: Dispatch<SetStateAction<HouseCoordinatesMap>>;
  houseCoordinatesMap: HouseCoordinatesMap | null;
};

export const useGameStore = create<Game>((set) => ({
  currentLevel: 1,
  isOrbitControlEnabled: true,
  isCurrentLevelCompleted: false,
  goToNextLevel: () =>
    set((state) => ({
      currentLevel: state.currentLevel + 1,
      isCurrentLevelCompleted: false,
    })),
  setCurrentLevelCompleted: () =>
    set((state) => ({ isCurrentLevelCompleted: true })),
  setIsOrbitControlEnabled: (enabled: boolean) =>
    set(() => ({ isOrbitControlEnabled: enabled })),
  houseCoordinatesMap: null,
  setHouseCoordinatesMap: (input) =>
    set((state) => ({
      houseCoordinatesMap: state.houseCoordinatesMap
        ? { ...state.houseCoordinatesMap, ...input }
        : { ...input },
    })),
}));
