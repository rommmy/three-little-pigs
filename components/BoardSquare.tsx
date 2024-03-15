type Props = {
  position: THREE.Vector3Tuple;
  color: string;
};

export default function BoardSquare({ position, color }: Props) {
  return (
    <group position={position}>
      {/* Main square */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Recessed area */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.7]} />
        <meshStandardMaterial color="#00b8d4" />
      </mesh>
    </group>
  );
}
