/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Author: ZTOONE3D (https://sketchfab.com/ZTOONE3D)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/cute-pig-a2c2962282c14eb0b6561c278d5a448f
Title: Cute Pig
*/
import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useRef } from 'react';

export function PigModel(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/pig.glb');
  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null} scale={0.35}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="3c493be6911a4c7f917b2a2268ed677afbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group
                  name="Pig_Body"
                  position={[0, 161.758, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={100}
                >
                  <mesh
                    name="Pig_Body_Pig_Color_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Pig_Body_Pig_Color_0.geometry}
                    material={materials.Pig_Color}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/pig.glb');
