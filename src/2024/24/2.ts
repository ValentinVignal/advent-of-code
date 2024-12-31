import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-2" : ""}.txt`),
  "utf-8"
);

// x00 to x44
// y00 to y44
// z00 to z45
//
// From the test on all additions
// x + y expected z
//
// 0 + 128 expected 8192, got 16384
// Issue with y07 to z07
// z07, rgc
//
// 0 + 8192 expected 8192, got 16384
// Issue from y13 to z13
// z013, pqc
//
// 0 + 16777216 expected 16777216, got 33554432
// Issue from y24 to z24
// z024, gvs
// wsv, rjm
//
// 0 + 2147483648 expected 2147483648, got 4294967296
// Issue from y31 to z31
// z31, bgs

const toInvert = [
  // ["z07", "rgc"],
  ["z07", "swt"],
  ["z13", "pqc"],
  // ["z24", "gvs"],
  ["wsv", "rjm"],
  ["z31", "bgs"],
] as const;

const toInvertMap = new Map();
for (const [node0, node1] of toInvert) {
  toInvertMap.set(node0, node1);
  toInvertMap.set(node1, node0);
}

const wiresText = textInput.split("\n\n")[1];

enum operator {
  Or = "OR",
  And = "AND",
  XOr = "XOR",
}

type Gate = {
  operator: operator;
  input1: string;
  input2: string;
  output: string;
};

const gates: Gate[] = wiresText
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    let [expressionText, output] = line.split(" -> ");
    const [input1, operator, input2] = expressionText.split(" ");
    if (toInvertMap.has(output)) {
      output = toInvertMap.get(output);
    }
    return {
      operator: operator as operator,
      input1,
      input2,
      output,
    } as Gate;
  });

/**
 *
 * @param values Modified in place.
 */
const runProgram = (values: Map<string, number>): void => {
  let hasUnknownValues = true;

  while (hasUnknownValues) {
    hasUnknownValues = false;
    for (const gate of gates) {
      if (values.has(gate.output)) {
        continue;
      }
      if (!values.has(gate.input1) || !values.has(gate.input2)) {
        hasUnknownValues = true;
        continue;
      }
      const value1 = values.get(gate.input1)!;
      const value2 = values.get(gate.input2)!;
      let value: number;
      switch (gate.operator) {
        case operator.Or:
          value = (value1 | value2) >>> 0;
          break;
        case operator.And:
          value = (value1 & value2) >>> 0;
          break;
        case operator.XOr:
          value = (value1 ^ value2) >>> 0;
          break;
      }
      values.set(gate.output, value);
    }
  }
};

/**
 * Verify x and y are correctly added.
 * @param x
 * @param y
 */
const add = (x: number, y: number): boolean => {
  const xBinaryString = x.toString(2).padStart(46, "0");
  const yBinaryString = y.toString(2).padStart(46, "0");
  const values = new Map<string, number>();
  for (let i = 0; i < xBinaryString.length; i++) {
    values.set(
      `x${i.toString().padStart(2, "0")}`,
      parseInt(xBinaryString[xBinaryString.length - 1 - i])
    );
  }
  for (let i = 0; i < yBinaryString.length; i++) {
    values.set(
      `y${i.toString().padStart(2, "0")}`,
      parseInt(yBinaryString[yBinaryString.length - 1 - i])
    );
  }

  runProgram(values);
  const entries = [...values.entries()]
    .filter(([key]) => key.startsWith("z"))
    .sort((a, b) => b[0].localeCompare(a[0]));

  const binaryString = entries.map(([_, value]) => value).join("");

  const result = parseInt(binaryString, 2);

  const isCorrect = result === x + y;

  console.log(
    isCorrect,
    `${x} + ${y} expected ${x + y}, got ${result}. Binary: ${x.toString(
      2
    )} + ${y.toString(2)} expected ${(x + y).toString(
      2
    )}, got ${result.toString(2)}`
  );

  return isCorrect;
};

for (let i = -1; i < 45; i++) {
  for (let j = -1; j < 45; j++) {
    const x = i === -1 ? 0 : 2 ** i;
    const y = j === -1 ? 0 : 2 ** j;
    add(x, y);
  }
}

// for (let i = 2 ** 45 - 1; i >= 0; i--) {
//   for (let j = 2 ** 45 - 1; j >= 0; j--) {
//     const x = i;
//     const y = j;
//     add(x, y);
//   }
// }
const result = toInvert.flat().sort().join(",");

add(2 ** 45 - 1, 2 ** 45 - 1);

// x != bgs,pqc,rgc,rjm,wsv,z07,z13,z31
console.log(result); // bgs,pqc,rjm,swt,wsv,z07,z13,z31
