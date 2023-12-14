import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type State = "." | "#" | "O";

const platform = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as State[]);

const tiltedPlatform = Array.from({ length: platform.length }, () =>
  Array(platform[0].length).fill(".")
);

for (const [y, row] of platform.entries()) {
  for (const [x, state] of row.entries()) {
    if (state === ".") continue;
    if (state === "#") {
      tiltedPlatform[y][x] = state;
      continue;
    }
    let newY = y;
    while (newY > 0 && tiltedPlatform[newY - 1][x] === ".") {
      newY--;
    }
    tiltedPlatform[newY][x] = "O";
  }
}

const printPlatform = (platform: State[][]) => {
  console.log(platform.map((row) => row.join("")).join("\n"));
};

const result = tiltedPlatform
  .map((row, index, array) => {
    return row.filter((state) => state === "O").length * (array.length - index);
  })
  .reduce((a, b) => a + b, 0);

printPlatform(platform);
console.log();
printPlatform(tiltedPlatform);

console.log(result); // 109654
