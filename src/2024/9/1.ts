import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
type Block = {
  id: number | null; // Null if free space.
  length: number;
};

const input: Block[] = textInput
  .split("")
  .filter(Boolean)
  .map(Number)
  .map((length, index) => {
    if (index % 2) {
      // It is a free space.
      return { id: null, length };
    }

    return { id: Math.floor(index / 2), length };
  });

let index = 0;

const orderedInput = [...input];

const enableLogs = false;

const logState = () => {
  if (!enableLogs) return;
  console.log(
    orderedInput
      .map((block) => (block.id?.toString() ?? ".").repeat(block.length))
      .join("")
  );
};

while (index < orderedInput.length) {
  logState();
  const space = orderedInput[index];
  if (space.id !== null) {
    // it is not a free space.
    index++;
    continue;
  }
  if (!space.length) {
    orderedInput.splice(index, 1);
    continue;
  }
  const last = orderedInput[orderedInput.length - 1];
  if (last.id === null) {
    orderedInput.pop();
    continue;
  }
  const remainingSpace = Math.max(0, space.length - last.length);
  const movedLength = Math.min(space.length, last.length);
  space.length = remainingSpace;
  last.length -= movedLength;
  orderedInput.splice(index, 0, {
    id: last.id,
    length: movedLength,
  });

  if (last.length <= space.length) {
    orderedInput.pop();
  }
}

const result = orderedInput.reduce<{ index: number; sum: number }>(
  (acc, block) => {
    const nextIndex = acc.index + block.length;
    const newSum =
      acc.sum +
      block.id! * block.length * (acc.index - 1 + (block.length + 1) / 2);
    return {
      index: nextIndex,
      sum: newSum,
    };
  },
  { index: 0, sum: 0 }
).sum;

console.log(result); // 6349606724455
