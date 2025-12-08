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

/**
 * Returns the accumulator value if the program terminates correctly,
 * or null if it enters an infinite loop.
 */
const runProgram = (instructions: Instruction[]): number | null => {
  let acc = 0;

  const visitedIndexes = new Set<number>();

  let currentIndex = 0;

  while (true) {
    if (currentIndex >= instructions.length) {
      return acc;
    }
    if (visitedIndexes.has(currentIndex)) {
      return null;
    }
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
};

let result: number;

for (const [index, instruction] of instructions.entries()) {
  if (instruction.operation === Operation.acc) {
    continue;
  }
  const modifiedInstructions = [
    ...instructions.slice(0, index),
    {
      ...instruction,
      operation:
        instruction.operation === Operation.jmp ? Operation.nop : Operation.jmp,
    },
    ...instructions.slice(index + 1),
  ];
  const value = runProgram(modifiedInstructions);
  if (value !== null) {
    result = value;
    break;
  }
}

console.log(result!); // 640
