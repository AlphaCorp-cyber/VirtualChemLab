import * as THREE from "three";

/**
 * Simple physics utilities for lab interactions
 */

export function checkCollision(
  pos1: [number, number, number],
  pos2: [number, number, number],
  threshold: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[1] - pos2[1], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
  
  return distance < threshold;
}

export function getDistance(
  pos1: [number, number, number],
  pos2: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[1] - pos2[1], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
}

export function normalizeVector(vector: THREE.Vector3): THREE.Vector3 {
  return vector.clone().normalize();
}

export function interpolatePosition(
  from: [number, number, number],
  to: [number, number, number],
  factor: number
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * factor,
    from[1] + (to[1] - from[1]) * factor,
    from[2] + (to[2] - from[2]) * factor
  ];
}

export class AABB {
  min: THREE.Vector3;
  max: THREE.Vector3;

  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min;
    this.max = max;
  }

  static fromCenterAndSize(center: THREE.Vector3, size: THREE.Vector3): AABB {
    const halfSize = size.clone().multiplyScalar(0.5);
    return new AABB(
      center.clone().sub(halfSize),
      center.clone().add(halfSize)
    );
  }

  intersects(other: AABB): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y &&
      this.min.z <= other.max.z &&
      this.max.z >= other.min.z
    );
  }

  containsPoint(point: THREE.Vector3): boolean {
    return (
      point.x >= this.min.x &&
      point.x <= this.max.x &&
      point.y >= this.min.y &&
      point.y <= this.max.y &&
      point.z >= this.min.z &&
      point.z <= this.max.z
    );
  }
}
