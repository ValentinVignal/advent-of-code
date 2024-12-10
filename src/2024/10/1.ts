import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type TopographicMap = number[][];

const input: TopographicMap = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean).map(Number));

type XY = { x: number; y: number };

const xyToString = (xy: XY): string => `${xy.x},${xy.y}`;
const stringToXY = (str: string): XY => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const getScore = (trailHead: XY): number => {
  const reachable = [new Set<string>()];
  reachable[0].add(xyToString(trailHead));

  while (reachable.length < 10) {
    const previousReachable = reachable[reachable.length - 1];
    const newReachable = new Set<string>();
    const currentHeight = reachable.length - 1;
    const newHeight = currentHeight + 1;
    reachable.push(newReachable);

    for (const previousXYString of previousReachable) {
      const xy = stringToXY(previousXYString);

      const newXYs = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
      ].map((delta) => addXY(xy, delta));

      for (const newXY of newXYs) {
        if (newXY.x < 0 || newXY.x >= input[0].length) continue;
        if (newXY.y < 0 || newXY.y >= input.length) continue;
        if (input[newXY.y][newXY.x] !== newHeight) continue;
        newReachable.add(xyToString(newXY));
      }
    }

    if (!newReachable.size) return 0;
  }
  return reachable[9].size;
};

let result = 0;

for (let j = 0; j < input.length; j++) {
  for (let i = 0; i < input[j].length; i++) {
    const trailHead = input[j][i];
    if (trailHead) continue;
    const score = getScore({ x: i, y: j });
    result += score;
  }
}

console.log(result); // 552
