import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const [time, distance] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(":")[1].split(" ").filter(Boolean).join(""))
  .map(Number);

let minHold = 0;
let maxHold = time;

const distanceFromHold = (hold: number): number => (time - hold) * hold;

while (distanceFromHold(minHold) <= distance) {
  minHold++;
}

while (distanceFromHold(maxHold) <= distance) {
  maxHold--;
}

const result = maxHold - minHold + 1;

console.log(result); // 45128024
