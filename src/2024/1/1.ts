import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const list0: number[] = [];
const list1: number[] = [];

for (const line of textInput.split("\n").filter(Boolean)) {
  const nums = line.split("   ").map(Number);
  list0.push(nums[0]);
  list1.push(nums[1]);
}

list0.sort((a, b) => a - b);
list1.sort((a, b) => a - b);

let result = 0;
for (let i = 0; i < list0.length; i++) {
  result += Math.abs(list0[i] - list1[i]);
}

console.log(result); // 2264607
