import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "#";

const input: Tile[][] = textInput
  .trim()
  .split("\n")
  .map((line) => line.split("") as Tile[]);

type Move = {
  right: number;
  down: number;
};

const moves: Move[] = [
  { right: 1, down: 1 },
  { right: 3, down: 1 },
  { right: 5, down: 1 },
  { right: 7, down: 1 },
  { right: 1, down: 2 },
];

const foundTrees: number[] = [];

for (const move of moves) {
  let result = 0;
  let i = 0;
  for (let rowIndex = 0; rowIndex < input.length; rowIndex += move.down) {
    const columnIndex = (i * move.right) % input[0].length;
    if (input[rowIndex][columnIndex] === "#") {
      result++;
    }
    i++;
  }
  foundTrees.push(result);
}

const result = foundTrees.reduce((acc, curr) => acc * curr, 1);

console.log(result); // 736527114
