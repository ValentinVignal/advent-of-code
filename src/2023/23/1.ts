import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "#" | ">" | "<" | "v" | "^";

const map = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

const width = map[0].length;
const height = map.length;

type Point = {
  x: number;
  y: number;
};

const pointToString = (point: Point): string => `${point.x},${point.y}`;

const start = { x: 1, y: 0 };
const end = { x: width - 2, y: height - 1 };

const deltas = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const findPath = (visitedPoints: Set<string>, point: Point): number => {
  const key = pointToString(point);
  if (visitedPoints.has(key)) return 0;

  if (point.x === end.x && point.y === end.y) return visitedPoints.size;

  const possiblePaths = deltas.map((delta) => {
    const newPoint = {
      x: point.x + delta.x,
      y: point.y + delta.y,
    };

    const tile = map[newPoint.y]?.[newPoint.x];
    switch (tile) {
      case undefined:
        return 0;
      case "#":
        return 0;
      case ">":
        if (delta.x !== 1) return 0;
        break;
      case "<":
        if (delta.x !== -1) return 0;
        break;
      case "^":
        if (delta.y !== -1) return 0;
        break;
      case "v":
        if (delta.y !== 1) return 0;
        break;
      default:
        break;
    }

    return findPath(new Set([...visitedPoints, key]), newPoint);
  });

  return Math.max(...possiblePaths);
};

const result = findPath(new Set(), start);

console.log(result); // 2278
