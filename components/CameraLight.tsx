import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

export default function CameraLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (light.current) {
      light.current.position.copy(camera.position);
    }
  });

  return <directionalLight ref={light} color="white" intensity={1} />;
}
