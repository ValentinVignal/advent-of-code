import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type XYZ = {
  x: number;
  y: number;
  z: number;
};

const coordinates: XYZ[] = textInput.split("\n").map((row) => {
  const coordinatesString = row.split("<")[1].split(">")[0];
  const [x, y, z] = coordinatesString
    .split(", ")
    .map((coordinate) => coordinate.split("=")[1])
    .map(Number);
  return { x, y, z };
});

type Point = {
  position: XYZ;
  velocity: XYZ;
};

const points: Point[] = coordinates.map((position) => ({
  position,
  velocity: { x: 0, y: 0, z: 0 },
}));

const step = (points: Point[]): Point[] => {
  const newPoints = structuredClone(points);
  // Update velocity
  for (let i = 0; i < newPoints.length; i++) {
    for (let j = 0; j < newPoints.length; j++) {
      if (i === j) continue;
      const pointI = newPoints[i];
      const pointJ = newPoints[j];

      if (pointI.position.x > pointJ.position.x) {
        pointI.velocity.x--;
      } else if (pointI.position.x < pointJ.position.x) {
        pointI.velocity.x++;
      }
      if (pointI.position.y > pointJ.position.y) {
        pointI.velocity.y--;
      } else if (pointI.position.y < pointJ.position.y) {
        pointI.velocity.y++;
      }
      if (pointI.position.z > pointJ.position.z) {
        pointI.velocity.z--;
      } else if (pointI.position.z < pointJ.position.z) {
        pointI.velocity.z++;
      }
    }
  }

  // Update the positions

  for (const point of newPoints) {
    point.position.x += point.velocity.x;
    point.position.y += point.velocity.y;
    point.position.z += point.velocity.z;
  }
  return newPoints;
};

type XYZKey = keyof XYZ;

const xyzEqual = (pointA: XYZ, pointB: XYZ, axis: XYZKey): boolean =>
  pointA[axis] === pointB[axis];

const pointsEqual = (pointA: Point, pointB: Point, axis: XYZKey): boolean => {
  return (
    xyzEqual(pointA.position, pointB.position, axis) &&
    xyzEqual(pointA.velocity, pointB.velocity, axis)
  );
};

const findCycles = (): XYZ => {
  const history = [points];
  const cycles: XYZ = {
    x: 0,
    y: 0,
    z: 0,
  };

  while (!cycles.x || !cycles.y || !cycles.z) {
    const newPoints = step(history[history.length - 1]);
    history.push(newPoints);
    for (const axis of ["x", "y", "z"] as const) {
      if (cycles[axis]) continue;
      if (
        newPoints.every((point, index) =>
          pointsEqual(point, history[0][index], axis),
        )
      ) {
        cycles[axis] = history.length - 1;
      }
    }
  }
  return cycles;
};

const cycles = findCycles();

const gcd = (a: number, b: number): number => {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
};

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const result = lcm(lcm(cycles.x, cycles.y), cycles.z);

console.log(result); // 354540398381256
