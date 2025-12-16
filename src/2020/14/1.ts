import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Mask = {
  instruction: "mask";
  mask: Map<number, number>;
};

type Memory = {
  instruction: "mem";
  index: number;
  value: number;
};

type Instruction = Mask | Memory;

const instructions: Instruction[] = textInput.split("\n").map((line) => {
  const [instructionString, valueString] = line.split(" = ");
  if (instructionString === "mask") {
    const map = new Map(
      valueString
        .split("")
        .map((value, index) => [index, value] as [number, string])
        .filter((el) => el[1] !== "X")
        .map(([index, value]) => [index, parseInt(value)])
    );
    return {
      instruction: "mask",
      mask: map,
    };
  } else {
    const index = parseInt(instructionString.split("[")[1].split("]")[0]);
    return {
      instruction: "mem",
      index,
      value: parseInt(valueString),
    };
  }
});

let memory = new Map<number, bigint>();
let mask = new Map<number, number>();

for (const instruction of instructions) {
  if (instruction.instruction === "mask") {
    mask = instruction.mask;
  } else {
    let value = BigInt(instruction.value);
    for (const [index, bit] of mask.entries()) {
      const bitValue = 1n << BigInt(35 - index);
      if (bit === 1) {
        value = value | bitValue;
      } else {
        value = value & ~bitValue;
      }
    }
    memory.set(instruction.index, value);
  }
}

const result = Array.from(memory.values()).reduce((acc, val) => acc + val, 0n);

console.log(memory);

// 9877140746949 < x
console.log(result); // 9879607673316
