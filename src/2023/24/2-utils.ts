export type XY = { x: number; y: number };

export type XYZ = XY & { z: number };

export const getInnerProduct = (a: XYZ, b: XYZ) => {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

export const getCrossProduct = (a: XYZ, b: XYZ) => {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
};

export const isVectorNull = (a: XYZ) => !a.x && !a.y && !a.z;

export const addXYZ = (a: XYZ, b: XYZ) => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const multiplyXYZ = (time: number, velocity: XYZ) => ({
  x: time * velocity.x,
  y: time * velocity.y,
  z: time * velocity.z,
});

/**
 * The plane is defined by the equation:
 *
 * ```
 * a * x + b * y + c * z + d = 0
 * ```
 */
export type Plane = {
  a: number;
  b: number;
  c: number;
  d: number;
};

export const isPointInPlane = (plane: Plane, point: XYZ) => {
  return (
    plane.a * point.x + plane.b * point.y + plane.c * point.z + plane.d === 0
  );
};

export const equalXYZ = (a: XYZ, b: XYZ) => {
  return a.x === b.x && a.y === b.y && a.z === b.z;
};

export const fromXYZTo3DArray = (xyz: XYZ): [number, number, number] => [
  xyz.x,
  xyz.y,
  xyz.z,
];
