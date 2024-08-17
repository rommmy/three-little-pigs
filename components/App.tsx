import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import GameEngine from './GameEngine';
import ScreenBoard from './ScreenBoard';

export default function App() {
  return (
    <>
      <ScreenBoard />
      <Canvas>
        <Suspense fallback={null}>
          <GameEngine />
        </Suspense>
      </Canvas>
    </>
  );
}
