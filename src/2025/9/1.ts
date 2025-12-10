import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Position = {
  x: number;
  y: number;
};

const input = textInput.split("\n").map((line) => {
  const [x, y] = line.split(",").map(Number);
  return { x, y } as Position;
});

let maxArea = 0;

for (let i = 0; i < input.length; i++) {
  for (let j = i + 1; j < input.length; j++) {
    const posA = input[i];
    const posB = input[j];

    const area = Math.abs(posA.x - posB.x + 1) * Math.abs(posA.y - posB.y + 1);
    maxArea = Math.max(maxArea, area);
  }
}

console.log("result:", maxArea); // 4772103936
