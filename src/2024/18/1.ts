import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type XY = {
  x: number;
  y: number;
};

const bytes: XY[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [x, y] = line.split(",").map(Number);
    return { x, y };
  })
  .slice(0, example ? 12 : 1024);

const size: XY = {
  x: example ? 7 : 71,
  y: example ? 7 : 71,
};

const xyToString = (xy: XY) => `${xy.x},${xy.y}`;

const bytesSet = new Set<string>(bytes.map(xyToString));

type State = XY & {
  score: number;
};

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const best = new Map<string, number>();

const queue: State[] = [{ x: 0, y: 0, score: 0 }];

const logMap = (): void => {
  const text = Array.from(Array(size.y))
    .map((_, y) =>
      Array.from(Array(size.x))
        .map((_, x) => {
          if (bytesSet.has(xyToString({ x, y }))) {
            return "#";
          }
          return ".";
        })
        .join("")
    )
    .join("\n");
  console.log(text);
};

logMap();

while (queue.length) {
  const state = queue.shift()!;
  const key = xyToString(state);
  if (bytesSet.has(key)) continue;
  if (state.score >= (best.get(key) ?? Infinity)) {
    continue;
  }
  best.set(key, state.score);

  const deltas: XY[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (const delta of deltas) {
    const next = addXY(state, delta);
    if (next.x < 0 || next.x >= size.x || next.y < 0 || next.y >= size.y) {
      continue;
    }
    queue.push({ ...next, score: state.score + 1 });
  }
}

const result = best.get(xyToString({ x: size.x - 1, y: size.y - 1 }))!;
console.log(result); // 286
