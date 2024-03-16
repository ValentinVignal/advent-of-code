import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  start: number;
  end: number;
};

type Instruction = {
  instruction: boolean;
  x: Range;
  y: Range;
  z: Range;
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
    const instruction = instructionText === "on";
    return {
      instruction,
      x: ranges[0],
      y: ranges[1],
      z: ranges[2],
    };
  });

type Cube = boolean[][][];
const cube: Cube = Array.from({ length: 101 }, () =>
  Array.from({ length: 101 }, () => Array.from({ length: 101 }, () => false))
);

for (const { instruction, x, y, z } of instructions) {
  for (let i = x.start; i <= x.end; i++) {
    const x = i + 50;
    if (x < 0 || x > 101) continue;
    for (let j = y.start; j <= y.end; j++) {
      const y = j + 50;
      if (y < 0 || y > 101) continue;
      for (let k = z.start; k <= z.end; k++) {
        const z = k + 50;
        if (z < 0 || z > 101) continue;

        cube[x][y][z] = instruction;
      }
    }
  }
}

const result = cube.flat(2).filter(Boolean).length;

console.log(result);
