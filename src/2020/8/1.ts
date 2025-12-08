import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

enum Operation {
  acc = "acc",
  jmp = "jmp",
  nop = "nop",
}

type Instruction = {
  operation: Operation;
  argument: number;
};

const instructions: Instruction[] = textInput.split("\n").map((line) => {
  const [operation, valueString] = line.split(" ");
  const sign = valueString[0] === "+" ? 1 : -1;
  const argument = Number(valueString.slice(1)) * sign;
  return { operation: operation as Operation, argument };
});

let acc = 0;

const visitedIndexes = new Set<number>();

let currentIndex = 0;

while (!visitedIndexes.has(currentIndex)) {
  visitedIndexes.add(currentIndex);
  const instruction = instructions[currentIndex];
  switch (instruction.operation) {
    case Operation.acc:
      acc += instruction.argument;
      currentIndex++;
      break;
    case Operation.jmp:
      currentIndex += instruction.argument;
      break;
    case Operation.nop:
      currentIndex++;
      break;
  }
}

console.log(acc); // 1528
