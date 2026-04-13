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

let points: Point[] = coordinates.map((position) => ({
  position,
  velocity: { x: 0, y: 0, z: 0 },
}));

const step = (): void => {
  // Update velocity
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pointI = points[i];
      const pointJ = points[j];

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

  for (const point of points) {
    point.position.x += point.velocity.x;
    point.position.y += point.velocity.y;
    point.position.z += point.velocity.z;
  }
};

for (let i = 0; i < 1000; i++) {
  step();
}

const getEnergy = (point: Point): number => {
  const energy =
    (Math.abs(point.position.x) +
      Math.abs(point.position.y) +
      Math.abs(point.position.z)) *
    (Math.abs(point.velocity.x) +
      Math.abs(point.velocity.y) +
      Math.abs(point.velocity.z));
  return energy;
};

const getTotalEnergy = (): number => {
  return points.reduce((a, b) => a + getEnergy(b), 0);
};

const result = getTotalEnergy();

// 2602 < x
// x != 80
console.log(result); // 7758
