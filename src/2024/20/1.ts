import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Point = "#" | "." | "S" | "E";

const map: Point[][] = textInput
  .split("\n")
  .map((line) => line.split("").filter(Boolean) as Point[]);

let index = 0;

const indexedMap = map.map((line) => line.map(() => -1));

type XY = { x: number; y: number };

let start!: XY;
let end!: XY;

let foundStart = false;
let foundEnd = false;

outer: for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[y].length; x++) {
    if (map[y][x] === "S") {
      start = { x, y };
      foundStart = true;
    } else if (map[y][x] === "E") {
      end = { x, y };
      foundEnd = true;
    }
    if (foundStart && foundEnd) {
      break outer;
    }
  }
}

let position = start;

indexedMap[position.y][position.x] = index;

while (map[position.y][position.x] !== "E") {
  index++;
  const possibleNextPositions: XY[] = [];

  const possibleNextTilePattern = [".", "E"];

  if (possibleNextTilePattern.includes(map[position.y - 1][position.x])) {
    possibleNextPositions.push({ x: position.x, y: position.y - 1 });
  }
  if (possibleNextTilePattern.includes(map[position.y + 1][position.x])) {
    possibleNextPositions.push({ x: position.x, y: position.y + 1 });
  }
  if (possibleNextTilePattern.includes(map[position.y][position.x - 1])) {
    possibleNextPositions.push({ x: position.x - 1, y: position.y });
  }
  if (possibleNextTilePattern.includes(map[position.y][position.x + 1])) {
    possibleNextPositions.push({ x: position.x + 1, y: position.y });
  }
  const nextPosition = possibleNextPositions.find(
    ({ x, y }) => indexedMap[y][x] === -1
  )!;
  indexedMap[nextPosition.y][nextPosition.x] = index;
  position = nextPosition;
}

const logMap = (): void => {
  const text = indexedMap
    .map((line, y) =>
      line
        .map((value, x) => {
          let textValue = value === -1 ? map[y][x] : value.toString();
          textValue = textValue.padStart(example ? 3 : 4);
          let coloredTextValue!: string;
          if (value === -1) {
            coloredTextValue = textValue;
          } else if (start.y === y && start.x === x) {
            coloredTextValue = `\x1b[1m\x1b[33m${textValue}\x1b[0m`;
          } else if (end.y === y && end.x === x) {
            coloredTextValue = `\x1b[1m\x1b[35m${textValue}\x1b[0m`;
          } else {
            coloredTextValue = `\x1b[1m\x1b[34m${textValue}\x1b[0m`;
          }
          return coloredTextValue;
        })
        .join(" ")
    )
    .join("\n");
  console.log(text);
};

logMap();

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const differences: number[] = [];

for (let y = 0; y < indexedMap.length; y++) {
  for (let x = 0; x < indexedMap[y].length; x++) {
    if (map[y][x] === "#") continue;
    const a: XY = { x, y };
    const deltas: XY[] = [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -2 },
      { x: 0, y: 2 },
      { x: -1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
    ];

    for (const delta of deltas) {
      const b = addXY(a, delta);
      if (
        b.x < 0 ||
        b.x >= indexedMap[0].length ||
        b.y < 0 ||
        b.y >= indexedMap.length
      ) {
        continue;
      }
      if (map[b.y][b.x] === "#") {
        continue;
      }

      const difference = indexedMap[b.y][b.x] - indexedMap[a.y][a.x] - 2;
      if (difference > 0) {
        if (difference === 64) console.log(a, b);
        differences.push(difference);
      }
    }
  }
}

const counts = new Map<number, number>();

for (const value of differences.values()) {
  counts.set(value, (counts.get(value) ?? 0) + 1);
}

const prettyLogCounts = (counts: Map<number, number>): void => {
  let text = "";
  const entries = Array.from(counts.entries());
  entries.sort((a, b) => a[0] - b[0]);
  for (const [key, value] of entries) {
    text += `${key}: ${value}\n`;
  }
  console.log(text);
};

prettyLogCounts(counts);

const result = differences.filter((value) => value >= 100).length;

// x < 4036 < 9815
console.log(result); // 1293
