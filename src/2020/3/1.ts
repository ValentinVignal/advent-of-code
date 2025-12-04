import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "#";

const input: Tile[][] = textInput
  .trim()
  .split("\n")
  .map((line) => line.split("") as Tile[]);

let result = 0;

for (let rowIndex = 0; rowIndex < input.length; rowIndex++) {
  const columnIndex = (rowIndex * 3) % input[0].length;
  if (input[rowIndex][columnIndex] === "#") {
    result++;
  }
}
console.log(result); // 167
