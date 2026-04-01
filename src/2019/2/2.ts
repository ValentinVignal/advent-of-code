import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const initialIntCode = textInput.split(",").filter(Boolean).map(Number);

const target = 19690720;

const run = (noun: number, verb: number): number | null => {
  const intCode = structuredClone(initialIntCode);
  intCode[1] = noun;
  intCode[2] = verb;
  for (let i = 0; i < intCode.length; i += 4) {
    const opCode = intCode[i];
    if (opCode === 99) {
      const result = intCode[0];
      return result;
    }

    if (![1, 2].includes(opCode)) {
      return null;
    }

    const i1 = intCode[i + 1];
    const v1 = intCode[i1];
    const i2 = intCode[i + 2];
    const v2 = intCode[i2];
    const iResult = intCode[i + 3];

    let result: number;
    if (opCode === 1) {
      result = v1 + v2;
    } else {
      result = v1 * v2;
    }
    intCode[iResult] = result;
  }
  return null;
};

let result: number;

outer: for (let noun = 0; noun < 100; noun++) {
  for (let verb = 0; verb < 100; verb++) {
    const runResult = run(noun, verb);
    if (runResult === target) {
      result = 100 * noun + verb;
      break outer;
    }
  }
}

// x < 19690720
console.log(result!); // 4967
