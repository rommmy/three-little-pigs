import { Canvas } from '@react-three/fiber';

import { CameraContextProvider } from '@/context/camera-context';
import { GameContextProvider } from '@/context/game-context';

import GameEngine from './GameEngine';

export default function App() {
  return (
    <CameraContextProvider>
      <GameContextProvider>
        <Canvas>
          <GameEngine />
        </Canvas>
      </GameContextProvider>
    </CameraContextProvider>
  );
}
