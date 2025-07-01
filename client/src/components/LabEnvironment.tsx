import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function createTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // White background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, 512, 512);
  
  // Gray tile lines
  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 2;
  
  // Draw grid pattern
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  
  return canvas;
}

export function LabEnvironment() {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Configure texture repetition
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);

  return (
    <>
      {/* Tiled lab floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={new THREE.CanvasTexture(createTileTexture())} />
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
