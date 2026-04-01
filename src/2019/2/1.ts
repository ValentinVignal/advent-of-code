import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const intCode = textInput.split(",").filter(Boolean).map(Number);

intCode[1] = 12;
intCode[2] = 2;

for (let i = 0; i < intCode.length; i += 4) {
  const opCode = intCode[i];
  if (opCode === 99) {
    break;
  }

  if (![1, 2].includes(opCode)) {
    throw Error(`Unknown opCode ${opCode}, index ${i}`);
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

const result = intCode[0];

// 874653 < 3371958 < x
console.log(result); // 5482655
