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

let max = 0;

type State = {
  visitedCornerPoints: Set<string>;
  count: number;
  point: Point;
  previousPoint?: Point;
};

const toProcess: State[] = [
  { visitedCornerPoints: new Set(), count: 0, point: start },
];

const process = (): void => {
  const { point, count, visitedCornerPoints, previousPoint } = toProcess.pop()!;

  const key = pointToString(point);
  if (visitedCornerPoints.has(key)) return;

  if (point.x === end.x && point.y === end.y) {
    max = Math.max(max, count);
    return;
  }

  let possiblePoints: Point[] = [];
  for (const delta of deltas) {
    const newPoint = {
      x: point.x + delta.x,
      y: point.y + delta.y,
    };

    const tile = map[newPoint.y]?.[newPoint.x];
    if (!tile || tile === "#") continue;
    if (newPoint.x === previousPoint?.x && newPoint.y === previousPoint?.y) {
      continue;
    }
    possiblePoints.push(newPoint);
  }

  const newVisitedCornerPoints =
    possiblePoints.length > 1
      ? new Set([...visitedCornerPoints, key])
      : visitedCornerPoints;

  toProcess.push(
    ...possiblePoints.map((possiblePoint) => ({
      visitedCornerPoints: newVisitedCornerPoints,
      count: count + 1,
      point: possiblePoint,
      previousPoint: point,
    }))
  );
};

let i = 0;
while (toProcess.length) {
  i++;
  if (!(i % 50000000))
    console.log("iteration", i, toProcess.length, "current max", max);
  process();
}

console.log(max); // 6734
