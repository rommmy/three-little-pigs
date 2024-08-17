import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export default function Lights() {
  const light = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (light.current) {
      light.current.position.copy(camera.position);
    }
  });

  useEffect(() => {
    camera.position.set(1, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight ref={light} color="white" intensity={1} />
    </>
  );
}
