import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const numbers = textInput.split("\n").filter(Boolean).map(Number);

const result = numbers
  .map((n) => Math.floor(n / 3) - 2)
  .reduce((a, b) => a + b, 0);

console.log(result); // 3371958
