import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "#";

type Space = Tile[][];

const input: Space = textInput
  .split("\n")
  .map((line) => line.split("") as Tile[]);

const computeBiodiversityRating = (space: Space): number => {
  let power = 0;
  let rating = 0;
  for (const row of space) {
    for (const tile of row) {
      if (tile === "#") {
        rating += 2 ** power;
      }
      power++;
    }
  }
  return rating;
};

const biodiversityRatings = new Set<number>();

biodiversityRatings.add(computeBiodiversityRating(input));

let space = input;

const computeNewSpace = (space: Space): Space => {
  const newSpace = structuredClone(space);

  for (let j = 0; j < space.length; j++) {
    for (let i = 0; i < space[j].length; i++) {
      const tile = space[j][i];
      let adjacentBugsCount = 0;
      for (const [dx, dy] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ] as const) {
        if (space[j + dy]?.[i + dx] === "#") {
          adjacentBugsCount++;
        }
      }

      if (tile === "#") {
        if (adjacentBugsCount !== 1) {
          newSpace[j][i] = ".";
        }
      } else {
        if (adjacentBugsCount === 1 || adjacentBugsCount === 2) {
          newSpace[j][i] = "#";
        }
      }
    }
  }
  return newSpace;
};

let result: number;

while (true) {
  space = computeNewSpace(space);
  const biodiversityRating = computeBiodiversityRating(space);
  if (biodiversityRatings.has(biodiversityRating)) {
    result = biodiversityRating;
    break;
  }
  biodiversityRatings.add(biodiversityRating);
}

console.log(result); // 25719471
