import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(
  path.join(__dirname, "input-example.txt"),
  "utf-8"
);

type PointSymbol = "." | "#";

const universe: PointSymbol[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as PointSymbol[]);

const expandedUniverse: PointSymbol[][] = universe.map((row) => [...row]);

for (let i = expandedUniverse.length - 1; i >= 0; i--) {
  const row = expandedUniverse[i];
  if (!row.includes("#")) {
    expandedUniverse.splice(i, 0, [...row]);
  }
}

for (let j = expandedUniverse[0].length - 1; j >= 0; j--) {
  const column = expandedUniverse.map((row) => row[j]);
  if (!column.includes("#")) {
    expandedUniverse.forEach((row) => row.splice(j, 0, "."));
  }
}

type Point = { x: number; y: number };
const galaxies: Point[] = [];

expandedUniverse.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === "#") {
      galaxies.push({ x, y });
    }
  });
});

const distances: number[] = [];

const getDistance = (point1: Point, point2: Point): number => {
  return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
};

galaxies.forEach((galaxy, i) => {
  galaxies.slice(i + 1).forEach((otherGalaxy) => {
    distances.push(getDistance(galaxy, otherGalaxy));
  });
});

const result = distances.reduce((acc, distance) => acc + distance, 0);

console.log(result); // 9550717
