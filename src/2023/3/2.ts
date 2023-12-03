import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
const digits = new Set<Digit>(
  Array.from(Array(10).keys()).map((n) => n.toString() as Digit)
);

const engine = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => [...line.split("").filter(Boolean), "."]);

let currentCluster = 0;
const clusters = engine.map((line, lineIndex) => {
  return line.map((char, columnIndex) => {
    if (digits.has(char as Digit)) {
      if (digits.has(engine[lineIndex]?.[columnIndex - 1] as Digit)) {
        return currentCluster;
      } else {
        return ++currentCluster;
      }
    }
    return null;
  });
});

const values: (number | null)[][] = [];

for (const [lineIndex, line] of engine.entries()) {
  values.push([]);
  let currentNumber: number | null = null;
  let currentLength = 0;
  for (const char of line) {
    if (digits.has(char as Digit)) {
      currentNumber = (currentNumber ?? 0) * 10 + parseInt(char);
      currentLength++;
    } else {
      if (currentNumber !== null) {
        values[lineIndex].push(
          ...Array(currentLength).fill(currentNumber),
          null
        );
        currentNumber = null;
      } else {
        values[lineIndex].push(null);
      }
      currentLength = 0;
    }
  }
}

if (values.length !== engine.length || values[0].length !== engine[0].length) {
  throw new Error(`Invalid values
  values: ${values.length}x${values[0].length},
  engine: ${engine.length}x${engine[0].length}
`);
}

const isGear = (line: number, column: number): boolean => {
  const gearClusters = new Set<number>();

  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      const cluster = clusters[line + dy]?.[column + dx];
      if (cluster) {
        gearClusters.add(cluster);
      }
    }
  }
  return gearClusters.size === 2;
};

const gearValue = (line: number, column: number): number => {
  const gearValues = new Set<number>();
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (dx === 0 && dy === 0) continue;
      const value = values[line + dy]?.[column + dx];
      if (value !== null) {
        gearValues.add(value);
      }
    }
  }
  if (gearValues.size === 2) {
    return Array.from(gearValues).reduce((acc, value) => acc * value, 1);
  } else if (gearValues.size === 1) {
    return Array.from(gearValues)[0] ** 2;
  } else {
    throw new Error(`Invalid gear {${[...gearValues.values()]}}`);
  }
};

let sum = 0;
for (const [lineIndex, line] of engine.entries()) {
  for (const [columnIndex, char] of line.entries()) {
    if (char !== "*") continue;
    if (isGear(lineIndex, columnIndex)) {
      sum += gearValue(lineIndex, columnIndex);
    }
  }
}

console.log(sum);
