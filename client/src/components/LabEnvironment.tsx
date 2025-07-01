import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function LabEnvironment() {
  const woodTexture = useTexture("/textures/wood.jpg");
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repetition
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      {/* Lab bench */}
      <group position={[0, 0.9, -1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.1, 2]} />
          <meshStandardMaterial map={woodTexture} color="#8B4513" />
        </mesh>
        
        {/* Bench legs */}
        {[-2.8, 2.8].map((x, i) => 
          [-0.8, 0.8].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -0.45, z]} castShadow>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))
        )}
      </group>
      
      {/* Back wall */}
      <mesh position={[0, 2, -3]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      
      {/* Side walls */}
      <mesh position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      
      <mesh position={[6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    </>
  );
}
