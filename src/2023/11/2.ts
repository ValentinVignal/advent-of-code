import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type PointSymbol = "." | "#";

const universe: PointSymbol[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as PointSymbol[]);

const emptyRowIndex: number[] = [];

const emptyColumnIndex: number[] = [];

universe.forEach((row, i) => {
  if (!row.includes("#")) {
    emptyRowIndex.push(i);
  }
});

for (let j = 0; j < universe[0].length; j++) {
  if (!universe.map((row) => row[j]).includes("#")) {
    emptyColumnIndex.push(j);
  }
}

type Point = { x: number; y: number };
const galaxies: Point[] = [];

universe.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === "#") {
      galaxies.push({ x, y });
    }
  });
});

const distances: number[] = [];

const expansionDistance = 1000000 - 1;
const getDistance = (point1: Point, point2: Point): number => {
  let distance = Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
  const minX = Math.min(point1.x, point2.x);
  const maxX = Math.max(point1.x, point2.x);
  const minY = Math.min(point1.y, point2.y);
  const maxY = Math.max(point1.y, point2.y);

  for (let x = minX + 1; x < maxX; x++) {
    if (emptyColumnIndex.includes(x)) {
      distance += expansionDistance;
    }
  }

  for (let y = minY + 1; y < maxY; y++) {
    if (emptyRowIndex.includes(y)) {
      distance += expansionDistance;
    }
  }
  return distance;
};

galaxies.forEach((galaxy, i) => {
  galaxies.slice(i + 1).forEach((otherGalaxy) => {
    distances.push(getDistance(galaxy, otherGalaxy));
  });
});

const result = distances.reduce((acc, distance) => acc + distance, 0);

// x < 648458902267
console.log(result); // 648458253817
