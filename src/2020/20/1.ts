import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Pixel = "." | "#";

type Tile = {
  id: number;
  pixels: Pixel[][];
};

const input: Tile[] = textInput.split("\n\n").map((block) => {
  const [idLine, ...grid] = block.split("\n");

  const id = Number(idLine.split(" ")[1].split(":")[0]);

  const pixels = grid.map((line) => line.split("")) as Pixel[][];
  return {
    id,
    pixels,
  };
});

const rotate = <T>(matrix: T[][]): T[][] => {
  return Array.from(matrix[0], (_, rowIndex) =>
    Array.from(matrix, (_, columnIndex) => {
      return matrix[matrix.length - 1 - columnIndex][rowIndex];
    }),
  );
};

const flip = <T>(matrix: T[][]): T[][] => {
  return matrix.map((row) => [...row].reverse());
};

const transformTile = (
  tile: Tile,
  rotation: 0 | 1 | 2 | 3,
  flipped: boolean,
): Pixel[][] => {
  let pixels = tile.pixels;
  if (flipped) {
    pixels = flip(pixels);
  }
  for (let r = 0; r < rotation; r++) {
    pixels = rotate(pixels);
  }
  return pixels;
};

type RotatedTile = {
  id: number;
  rotation: 0 | 1 | 2 | 3;
  flipped: boolean;
};

const reconstructImage = (): RotatedTile[][] => {
  const reconstructImageRecursive = (
    state: RotatedTile[][],
    visited: Set<number>,
  ): RotatedTile[][] | null => {
    console.log("Visited", visited.size);
    if (!visited.size) {
      // Initial state, just start with any.
      for (const tile of input) {
        for (const flipped of [false, true]) {
          for (const rotation of [0, 1, 2, 3] as const) {
            const result = reconstructImageRecursive(
              [[{ id: tile.id, rotation, flipped }]],
              new Set([tile.id]),
            );
            if (result) return result;
          }
        }
      }
    } else if (visited.size === input.length) {
      return state;
    }

    // Find the next tile that could fit.
    for (const tile of input.filter((tile) => !visited.has(tile.id))) {
      for (const flipped of [false, true]) {
        for (const rotation of [0, 1, 2, 3] as const) {
          // Rotated and see if it matches a position.

          let rotated = transformTile(tile, rotation, flipped);

          for (let rowIndex = 0; rowIndex <= state.length; rowIndex++) {
            if (state[rowIndex]?.length === state[rowIndex - 1]?.length)
              continue;
            // We only fill it this way:
            // a b c d
            // e f g
            // h i j
            // k
            // l

            // Check that the new tile matches the one on the left and the top.

            const rowLength = state[rowIndex]?.length ?? 0;

            if (rowIndex > 0) {
              // Check the top.
              const topTile = state[rowIndex - 1][rowLength];
              const topTilePixels = input.find(
                (tileInput) => tileInput.id === topTile.id,
              )!.pixels;
              const topTileBottomPixels =
                topTilePixels[topTilePixels.length - 1];
              const tileTopPixels = rotated[0];
              if (
                !topTileBottomPixels.every(
                  (pixel, index) => pixel === tileTopPixels[index],
                )
              ) {
                continue;
              }
            }
            if (rowLength > 0) {
              // Check the left.
              const leftTile = state[rowIndex][rowLength - 1];
              const leftTilePixels = input.find(
                (tileInput) => tileInput.id === leftTile.id,
              )!.pixels;
              const leftTileRightPixels = leftTilePixels.map(
                (row) => row[row.length - 1],
              );
              const tileLeftPixels = rotated.map((row) => row[0]);
              if (
                !leftTileRightPixels.every(
                  (pixel, index) => pixel === tileLeftPixels[index],
                )
              ) {
                continue;
              }
            }

            // The tile matches

            const newState = structuredClone(state);
            if (!newState[rowIndex]) {
              newState[rowIndex] = [];
            }
            newState[rowIndex].push({ id: tile.id, rotation, flipped });
            // If it does, continue.
            const result = reconstructImageRecursive(
              newState,
              new Set([...visited, tile.id]),
            );
            if (result) {
              return result;
            }
          }
        }
      }
    }
    return null;
  };

  return reconstructImageRecursive([], new Set())!;
};

const reconstructedImage = reconstructImage();

const result = [
  reconstructedImage[0][0],
  reconstructedImage[0][reconstructedImage[0].length - 1],
  reconstructedImage[reconstructedImage.length - 1][0],
  reconstructedImage[reconstructedImage.length - 1][
    reconstructedImage[0].length - 1
  ],
]
  .map((tile) => tile.id)
  .reduce((a, b) => a * b, 1);

console.log(result);
