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
  })
  .filter(({ x, y, z }) => {
    return (
      Math.min(
        ...[x.start, x.end, y.start, y.end, z.start, z.end].map((x) =>
          Math.abs(x)
        )
      ) > 1000
    );
  });

type Time3<T> = [T, T, T];

let allIndexes: Time3<number[]> = [[], [], []];

console.log("before feeding allIndexes");
for (const { x, y, z } of instructions) {
  allIndexes[0].push(x.start - 1, x.start, x.end, x.end + 1);
  allIndexes[1].push(y.start - 1, y.start, y.end, y.end + 1);
  allIndexes[2].push(z.start - 1, z.start, z.end, z.end + 1);
}

console.log(
  "Before using sets",
  [...allIndexes.map((a) => a.length)],
  [...allIndexes.map((a) => new Set(a).size)]
);
allIndexes = allIndexes.map((indexes) =>
  [...new Set(indexes)].sort((a, b) => a - b)
) as Time3<number[]>;

// const cubeIndexToArrayIndex: Time3<Map<number, number>> = Array.from(
//   { length: 3 },
//   () => new Map<number, number>()
// ) as Time3<Map<number, number>>;

// for (let dimension = 0; dimension < 3; dimension++) {
//   for (const [index, value] of allIndexes[dimension].entries()) {
//     cubeIndexToArrayIndex[dimension].set(value, index);
//   }
// }

console.log("before cube");
type Cube = boolean[][][];
const cube: Cube = Array.from({ length: allIndexes[0].length }, () =>
  Array.from({ length: allIndexes[1].length }, () =>
    Array.from({ length: allIndexes[2].length }, () => false)
  )
);

console.log("before instructions");
for (const { instruction, x, y, z } of instructions) {
  const ranges = [x, y, z];
  let cubeIndexesInRange: Time3<[number, number][]> = [[], [], []];
  for (let dimension = 0; dimension < 3; dimension++) {
    const range = ranges[dimension];
    cubeIndexesInRange[dimension] = allIndexes[dimension]
      .map((value, index) => [index, value] as [number, number])
      .filter((index) => range.start <= index[1] && index[1] <= range.end);
  }

  for (const [arrayX] of cubeIndexesInRange[0]) {
    for (const [arrayY] of cubeIndexesInRange[1]) {
      for (const [arrayZ] of cubeIndexesInRange[2]) {
        cube[arrayX][arrayY][arrayZ] = instruction;
      }
    }
  }
}
let res = 0;

for (const [xArrayIndex, yArray] of cube.entries()) {
  for (const [yArrayIndex, zArray] of yArray.entries()) {
    for (const [zArrayIndex, value] of zArray.entries()) {
      if (!value) continue;
      let xLength = 1;
      if (
        xArrayIndex !== 0 &&
        cube[xArrayIndex - 1][yArrayIndex][zArrayIndex]
      ) {
        const currentXCubeIndex = allIndexes[0][xArrayIndex];
        const previousXCubeIndex = allIndexes[0][xArrayIndex - 1];
        xLength = currentXCubeIndex - previousXCubeIndex;
      }

      let yLength = 1;
      if (
        yArrayIndex !== 0 &&
        cube[xArrayIndex][yArrayIndex - 1][zArrayIndex]
      ) {
        const currentYCubeIndex = allIndexes[1][yArrayIndex];
        const previousYCubeIndex = allIndexes[1][yArrayIndex - 1];
        yLength = currentYCubeIndex - previousYCubeIndex;
      }

      let zLength = 1;
      if (
        zArrayIndex !== 0 &&
        cube[xArrayIndex][yArrayIndex][zArrayIndex - 1]
      ) {
        const currentZCubeIndex = allIndexes[2][zArrayIndex];
        const previousZCubeIndex = allIndexes[2][zArrayIndex - 1];
        zLength = currentZCubeIndex - previousZCubeIndex;
      }
      res += xLength * yLength * zLength;
    }
  }
}

console.log(res);
