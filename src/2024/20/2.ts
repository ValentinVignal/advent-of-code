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

const distanceXY = (a: XY, b: XY): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const differences: number[] = [];

for (let yA = 0; yA < indexedMap.length; yA++) {
  for (let xA = 0; xA < indexedMap[yA].length; xA++) {
    if (map[yA][xA] === "#") continue;

    const a = { x: xA, y: yA };

    for (let yB = 0; yB < indexedMap.length; yB++) {
      for (let xB = 0; xB < indexedMap[yB].length; xB++) {
        if (map[yB][xB] === "#") continue;

        const b = { x: xB, y: yB };

        const distance = distanceXY(a, b);
        if (distance > 20) continue;

        const difference = indexedMap[yB][xB] - indexedMap[yA][xA] - distance;
        if (difference > 0) {
          differences.push(difference);
        }
      }
    }
  }
}

const counts = new Map<number, number>();

for (const value of differences.values()) {
  counts.set(value, (counts.get(value) ?? 0) + 1);
}

const minDifference = example ? 50 : 100;

const prettyLogCounts = (counts: Map<number, number>): void => {
  let text = "";
  const entries = Array.from(counts.entries()).filter(
    (value) => value[0] >= minDifference
  );
  entries.sort((a, b) => a[0] - b[0]);
  for (const [key, value] of entries) {
    text += `${key}: ${value}\n`;
  }
  console.log(text);
};

prettyLogCounts(counts);

const result = differences.filter((value) => value >= minDifference).length;

console.log(result); // 977747
