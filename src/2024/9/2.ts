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

const orderedInput = [...input];
let index = orderedInput.length - 1;

const enableLogs = false;

const logState = (currentIndex?: number) => {
  if (!enableLogs) return;
  console.log(
    orderedInput
      .map((block, index) => {
        let value = (block.id?.toString() ?? (index % 2 ? "." : ",")).repeat(
          block.length
        );
        if (index === currentIndex) {
          value = `\x1b[4m\x1b[32m${value}\x1b[0m`;
        }
        return value;
      })
      .join("")
  );
};

while (index > 0) {
  logState(index);
  const blockToMove = orderedInput[index];
  if (blockToMove.id === 6) {
    console.log("here");
  }
  if (blockToMove.id === null) {
    // it is not a block.
    index--;
    continue;
  }

  const spaceIndex = orderedInput.findIndex(
    (space, spaceIndex) =>
      space.id === null &&
      blockToMove.length <= space.length &&
      spaceIndex < index
  );
  if (spaceIndex === -1) {
    index--;
    continue;
  }
  const space = orderedInput[spaceIndex];
  const remainingSpace = Math.max(0, space.length - blockToMove.length);
  space.length = remainingSpace;
  orderedInput.splice(index, 1, {
    id: null,
    length: blockToMove.length,
  });
  orderedInput.splice(spaceIndex, 0, blockToMove);

  // Merge the spaces.

  for (let i = 0; i < orderedInput.length - 1; i++) {
    const current = orderedInput[i];
    const next = orderedInput[i + 1];
    if (current.id !== null || next.id !== null) continue;

    current.length += next.length;
    orderedInput.splice(i + 1, 1);
    i--;
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

console.log(result); // 6376648986651
