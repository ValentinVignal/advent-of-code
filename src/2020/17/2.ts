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
type HyperSpace = Space[];

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

const initialHyperGrid: HyperSpace = [
  ...Array.from({ length: 6 }, () =>
    Array.from(initialGrid, () =>
      Array.from(initialGrid[0], () =>
        Array.from(initialGrid[0][0], () => "." as Tile)
      )
    )
  ),
  initialGrid,
  ...Array.from({ length: 6 }, () =>
    Array.from(initialGrid, () =>
      Array.from(initialGrid[0], () =>
        Array.from(initialGrid[0][0], () => "." as Tile)
      )
    )
  ),
];

let grid = initialHyperGrid;

for (let cycle = 0; cycle < 6; cycle++) {
  const newGrid = structuredClone(grid);

  for (let z = 0; z < initialHyperGrid.length; z++) {
    for (let y = 0; y < initialHyperGrid[z].length; y++) {
      for (let x = 0; x < initialHyperGrid[z][y].length; x++) {
        for (let w = 0; w < initialHyperGrid[z][y][x].length; w++) {
          const currentTile = grid[z][y][x][w];
          let activeNeighbors = 0;

          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                for (let dw = -1; dw <= 1; dw++) {
                  if (dz === 0 && dy === 0 && dx === 0 && dw === 0) continue;
                  const nz = z + dz;
                  const ny = y + dy;
                  const nx = x + dx;
                  const nw = w + dw;
                  if (
                    nz < 0 ||
                    nz >= initialHyperGrid.length ||
                    ny < 0 ||
                    ny >= initialHyperGrid[nz].length ||
                    nx < 0 ||
                    nx >= initialHyperGrid[nz][ny].length ||
                    nw < 0 ||
                    nw >= initialHyperGrid[nz][ny][nx].length
                  ) {
                    continue;
                  }
                  if (grid[nz][ny][nx][nw] === Tile.Active) {
                    activeNeighbors++;
                  }
                }
              }
            }
          }

          if (currentTile === Tile.Active) {
            newGrid[z][y][x][w] =
              activeNeighbors === 2 || activeNeighbors === 3
                ? Tile.Active
                : Tile.Inactive;
          } else {
            newGrid[z][y][x][w] =
              activeNeighbors === 3 ? Tile.Active : Tile.Inactive;
          }
        }
      }
    }
  }
  grid = newGrid;
}

const activeCount = grid.reduce(
  (accZ, space) =>
    accZ +
    space.reduce(
      (accY, slice) =>
        accY +
        slice.reduce(
          (accX, line) =>
            accX +
            line.reduce(
              (accW, tile) => accW + (tile === Tile.Active ? 1 : 0),
              0
            ),
          0
        ),
      0
    ),
  0
);

console.log(activeCount); // 2400
