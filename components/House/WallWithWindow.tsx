import { useMemo } from 'react';
import * as THREE from 'three';

import { WALL_HEIGHT } from './House';

export default function WallWithWindow({
  position,
  color = '#e53935',
}: {
  position: THREE.Vector3Tuple;
  color: string;
}) {
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
}
