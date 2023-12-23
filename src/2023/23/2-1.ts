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

const stateToString = (
  visitedCornerPoints: Set<string>,
  count: number,
  point: Point
): string => {
  return [
    [...visitedCornerPoints].sort().join(","),
    count,
    pointToString(point),
  ].join("-");
};

const cache = new Map<string, number>();

const start = { x: 1, y: 0 };
const end = { x: width - 2, y: height - 1 };

const deltas = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const findPath = (
  visitedCornerPoints: Set<string>,
  count: number,
  point: Point
): number => {
  const cacheKey = stateToString(visitedCornerPoints, count, point);
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  const key = pointToString(point);
  if (visitedCornerPoints.has(key)) return 0;

  if (point.x === end.x && point.y === end.y) return count;

  let possiblePoints: Point[] = [];
  for (const delta of deltas) {
    const newPoint = {
      x: point.x + delta.x,
      y: point.y + delta.y,
    };

    const tile = map[newPoint.y]?.[newPoint.x];
    if (!tile || tile === "#") continue;
    possiblePoints.push(newPoint);
  }

  if (!possiblePoints.length) return 0;
  let result: number;
  if (possiblePoints.length === 1) {
    return findPath(visitedCornerPoints, count + 1, possiblePoints[0]);
  } else {
    const newVisitedCornerPoints = new Set([...visitedCornerPoints, key]);
    result = Math.max(
      ...possiblePoints.map((point) =>
        findPath(newVisitedCornerPoints, count + 1, point)
      )
    );
  }

  cache.set(cacheKey, result);
  return result;
};

const result = findPath(new Set(), 0, start);

console.log(result); // 2278
