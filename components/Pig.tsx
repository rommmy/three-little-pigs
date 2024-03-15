import { Vector3Tuple } from 'three'

type Props = {
  position: Vector3Tuple;
}

export default function Pig({position}: Props) {
  const renderBody = () => {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ec407a" />
      </mesh>
    )
  }

  return (
    <group>
      {renderBody()}
    </group>
  )
}