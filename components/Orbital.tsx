import { OrbitControls } from '@react-three/drei';

import { useGameStore } from '@/core/store';

export default function Orbital() {
  const isOrbitControlEnabled = useGameStore(
    (state) => state.isOrbitControlEnabled
  );

  return <OrbitControls enabled={isOrbitControlEnabled} />;
}
