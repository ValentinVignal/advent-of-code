import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type TopographicMap = number[][];

const input: TopographicMap = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean).map(Number));

type XY = { x: number; y: number };

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const getScore = (trailHead: XY): number => {
  let reachable = [[trailHead]];

  for (let newHeight = 1; newHeight < 10; newHeight++) {
    const newReachable: XY[][] = [];

    for (const path of reachable) {
      const previousXY = path[path.length - 1];

      const newXYs = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
      ].map((delta) => addXY(previousXY, delta));

      for (const newXY of newXYs) {
        if (newXY.x < 0 || newXY.x >= input[0].length) continue;
        if (newXY.y < 0 || newXY.y >= input.length) continue;
        if (input[newXY.y][newXY.x] !== newHeight) continue;
        newReachable.push([...structuredClone(path), newXY]);
      }
    }

    if (!newReachable.length) return 0;
    reachable = newReachable;
  }
  return reachable.length;
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

console.log(result); // 1225
