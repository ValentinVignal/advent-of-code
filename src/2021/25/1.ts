import { readFileSync } from "fs";
import path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

enum Space {
  South = "v",
  East = ">",
  Empty = ".",
}

type Floor = Space[][];

const floor = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("").filter(Boolean);
  }) as Floor;

// @ts-ignore
const logFloor = (): void => {
  const s = floor.map((line) => line.join("")).join("\n");
  console.log(s);
};

const height = floor.length;
const width = floor[0].length;

let step = 0;
let hasMoved = true;

type XY = {
  x: number;
  y: number;
};

const move = (): void => {
  let toMove: XY[] = [];
  // Move east first.
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const row = floor[rowIndex];
    for (let columnIndex = 0; columnIndex < width; columnIndex++) {
      const space = row[columnIndex];
      const nextColumnIndex = (columnIndex + 1) % width;
      if (
        space === Space.East &&
        floor[rowIndex][nextColumnIndex] === Space.Empty
      ) {
        toMove.push({
          x: columnIndex,
          y: rowIndex,
        });
      }
    }
  }
  hasMoved = hasMoved || !!toMove.length;
  for (const space of toMove) {
    const nextX = (space.x + 1) % width;
    floor[space.y][space.x] = Space.Empty;
    floor[space.y][nextX] = Space.East;
  }
  toMove = [];

  // Move south second
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const row = floor[rowIndex];
    for (let columnIndex = 0; columnIndex < width; columnIndex++) {
      const space = row[columnIndex];
      const nextRowIndex = (rowIndex + 1) % height;
      if (
        space === Space.South &&
        floor[nextRowIndex][columnIndex] === Space.Empty
      ) {
        toMove.push({
          x: columnIndex,
          y: rowIndex,
        });
      }
    }
  }
  hasMoved = hasMoved || !!toMove.length;
  for (const space of toMove) {
    const nextY = (space.y + 1) % height;
    floor[space.y][space.x] = Space.Empty;
    floor[nextY][space.x] = Space.South;
  }
};

while (hasMoved) {
  // console.log(step);
  // logFloor();
  step++;
  hasMoved = false;
  move();
}

console.log(step); // 360
