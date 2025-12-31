import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

enum Tile {
  Active = "#",
  Inactive = ".",
}

type Grid = Tile[][];
type Space = Grid[];

const input = textInput.split("\n").map((line) => line.split("") as Tile[]);

let initialSlice: Grid = input.map((line) => [
  ...Array(6).fill("."),
  ...line,
  ...Array(6).fill("."),
]);
initialSlice = [
  ...Array.from(
    { length: 6 },
    () => Array(initialSlice[0].length).fill(".") as Tile[]
  ),
  ...initialSlice,
  ...Array.from(
    { length: 6 },
    () => Array(initialSlice[0].length).fill(".") as Tile[]
  ),
];

const initialGrid: Space = [
  ...Array.from({ length: 6 }, () =>
    Array.from(initialSlice, () =>
      Array.from(initialSlice[0], () => "." as Tile)
    )
  ),
  initialSlice,
  ...Array.from({ length: 6 }, () =>
    Array.from(initialSlice, () =>
      Array.from(initialSlice[0], () => "." as Tile)
    )
  ),
];

let grid = initialGrid;

for (let cycle = 0; cycle < 6; cycle++) {
  const newGrid = structuredClone(grid);

  for (let z = 0; z < initialGrid.length; z++) {
    for (let y = 0; y < initialGrid[z].length; y++) {
      for (let x = 0; x < initialGrid[z][y].length; x++) {
        const currentTile = grid[z][y][x];
        let activeNeighbors = 0;

        for (let dz = -1; dz <= 1; dz++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dz === 0 && dy === 0 && dx === 0) continue;
              const nz = z + dz;
              const ny = y + dy;
              const nx = x + dx;
              if (
                nz < 0 ||
                nz >= initialGrid.length ||
                ny < 0 ||
                ny >= initialGrid[nz].length ||
                nx < 0 ||
                nx >= initialGrid[nz][ny].length
              ) {
                continue;
              }
              if (grid[nz][ny][nx] === Tile.Active) {
                activeNeighbors++;
              }
            }
          }
        }

        if (currentTile === Tile.Active) {
          newGrid[z][y][x] =
            activeNeighbors === 2 || activeNeighbors === 3
              ? Tile.Active
              : Tile.Inactive;
        } else {
          newGrid[z][y][x] =
            activeNeighbors === 3 ? Tile.Active : Tile.Inactive;
        }
      }
    }
  }
  grid = newGrid;
}

const activeCount = grid.reduce(
  (accZ, slice) =>
    accZ +
    slice.reduce(
      (accY, line) =>
        accY +
        line.reduce((accX, tile) => accX + (tile === Tile.Active ? 1 : 0), 0),
      0
    ),
  0
);

// x != 30
console.log(activeCount); // 448
