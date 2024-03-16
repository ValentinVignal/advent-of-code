import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  start: number;
  end: number;
};

type Cube = {
  x: Range;
  y: Range;
  z: Range;
};

type InstructionValue = -1 | 0 | 1;

type Instruction = Cube & {
  instruction: InstructionValue;
};

const instructions: Instruction[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [instructionText, rangesText] = line.split(" ");
    const ranges = rangesText.split(",").map((range) => {
      const [start, end] = range.split("=")[1].split("..").map(Number);
      return { start, end };
    });
    const instruction = instructionText === "on" ? 1 : 0;
    return {
      instruction,
      x: ranges[0],
      y: ranges[1],
      z: ranges[2],
    };
  });

const intersectRange = (a: Range, b: Range): Range | null => {
  if (a.start > b.end || a.end < b.start) {
    return null;
  }

  return {
    start: Math.max(a.start, b.start),
    end: Math.min(a.end, b.end),
  };
};

const intersectCube = (a: Cube, b: Cube): Cube | null => {
  const x = intersectRange(a.x, b.x);
  const y = intersectRange(a.y, b.y);
  const z = intersectRange(a.z, b.z);

  if (!x || !y || !z) {
    return null;
  }

  return { x, y, z };
};

const extraInstructions: Instruction[] = [];

for (const [index, instruction] of instructions.entries()) {
  const instructionsToAdd: Instruction[] = instructions
    .slice(0, index)
    .concat(extraInstructions)
    .map((previousInstruction) => {
      const previousInstructionValue = previousInstruction.instruction;
      const extraInstructionValue: InstructionValue =
        -previousInstructionValue as InstructionValue;

      if (!extraInstructionValue) return null;
      const intersect = intersectCube(instruction, previousInstruction);

      if (intersect) {
        return {
          ...intersect,
          instruction: extraInstructionValue,
        };
      }
      return null;
    })
    .filter(Boolean) as Instruction[];
  extraInstructions.push(...instructionsToAdd);
}

const cubeVolume = (cube: Cube): number =>
  (cube.x.end - cube.x.start + 1) *
  (cube.y.end - cube.y.start + 1) *
  (cube.z.end - cube.z.start + 1);

const result = instructions
  .concat(extraInstructions)
  .filter((instruction) => instruction.instruction)
  .reduce((acc, instruction) => {
    return acc + instruction.instruction * cubeVolume(instruction);
  }, 0);

console.log(result); // 1304385553084863
