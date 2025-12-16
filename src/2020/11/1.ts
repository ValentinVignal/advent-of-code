import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

enum Tile {
  Empty = "L",
  Occupied = "#",
  Floor = ".",
}

type Position = {
  x: number;
  y: number;
};

let grid = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

const iterate = (): boolean => {
  const newGrid = Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }, () => "." as Tile)
  );
  let hasChange = false;
  const iterateTile = (position: Position): void => {
    const currentState = grid[position.y][position.x];

    let newState = currentState;
    switch (currentState) {
      case Tile.Floor:
        break;
      case Tile.Empty:
      case Tile.Occupied:
        const otherSeats: Tile[] = [];
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            if (
              position.y + dy < 0 ||
              position.y + dy >= grid.length ||
              position.x + dx < 0 ||
              position.x + dx >= grid[0].length
            ) {
              continue;
            }
            const otherSeat = grid[position.y + dy][position.x + dx];
            otherSeats.push(otherSeat);
          }
        }
        if (currentState === Tile.Empty) {
          if (otherSeats.every((seat) => seat !== Tile.Occupied)) {
            hasChange = true;
            newState = Tile.Occupied;
          }
        } else {
          if (otherSeats.filter((seat) => seat === Tile.Occupied).length >= 4) {
            hasChange = true;
            newState = Tile.Empty;
          }
        }

        break;
    }
    newGrid[position.y][position.x] = newState;
  };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      iterateTile({ x, y });
    }
  }

  grid = newGrid;
  return hasChange;
};

while (iterate()) {}

const result = grid
  .map((row) => row.filter((tile) => tile === Tile.Occupied).length)
  .reduce((acc, value) => acc + value, 0);

// 2094 < x
console.log(result); // 2113
