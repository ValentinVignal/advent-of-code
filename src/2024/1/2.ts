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

let result = 0;

for (const num of list0) {
  result += num * list1.filter((n) => n === num).length;
}

console.log(result); // 19457120
