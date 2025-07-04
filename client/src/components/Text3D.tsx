import React from 'react';
import { Text } from '@react-three/drei';

interface Text3DProps {
  position: [number, number, number];
  text: string;
  fontSize?: number;
  color?: string;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export function Text3D({ 
  position, 
  text, 
  fontSize = 0.1, 
  color = "#000000",
  maxWidth = 2,
  textAlign = 'center'
}: Text3DProps) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      maxWidth={maxWidth}
      textAlign={textAlign}
      font="/fonts/Inter-Medium.woff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

export function InstructionText({ 
  position, 
  text, 
  fontSize = 0.08,
  color = "#2c3e50"
}: Omit<Text3DProps, 'maxWidth' | 'textAlign'>) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      maxWidth={3}
      textAlign="left"
      font="/fonts/Inter-Regular.woff"
      anchorX="left"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

export function LabelText({ 
  position, 
  text, 
  fontSize = 0.06,
  color = "#2c3e50"
}: Omit<Text3DProps, 'maxWidth' | 'textAlign'>) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      maxWidth={1.5}
      textAlign="center"
      font="/fonts/Inter-Medium.woff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}