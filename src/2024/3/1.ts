import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const regExp = /mul\((\d+),(\d+)\)/g;

const reports = textInput.replaceAll("\n", "");

const matches = reports.matchAll(regExp);

let result = 0;

for (const match of matches) {
  result += parseInt(match[1]) * parseInt(match[2]);
}

console.log(result); // 178538786
