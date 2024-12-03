import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const regExp = /mul\((\d+),(\d+)\)/g;
const doInstruction = "do()";
const doNotInstruction = "don't()";

let index = 0;
let enabled = true;
let result = 0;

const mulMatches = [...textInput.matchAll(regExp)];

while (index < textInput.length) {
  const text = textInput.slice(index);
  const nextInstruction = enabled ? doNotInstruction : doInstruction;
  const nextInstructionIndex = text.indexOf(nextInstruction);
  const nextMul = mulMatches.find((match) => match.index! >= index);
  const nextMulIndex = (nextMul?.index ?? Infinity) - index;
  if (nextMulIndex === Infinity) {
    break;
  }
  if (nextInstructionIndex < nextMulIndex && nextInstructionIndex !== -1) {
    enabled = !enabled;
    index += nextInstructionIndex + nextInstruction.length;
    continue;
  }
  if (enabled) {
    result += parseInt(nextMul![1]) * parseInt(nextMul![2]);
  }
  index += nextMulIndex + nextMul![0].length;
}

// x != 9744498
console.log(result); // 102467299
