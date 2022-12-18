
import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const inputs: ('<' | '>')[] = textInput.split('\n')[0].split('') as ('<' | '>')[];

const ROCKS = [
  ["  #### "],

  ["   #   ",
    "  ###  ",
    "   #   "],

  ["    #  ",
    "    #  ",
    "  ###  "],

  ["  #    ",
    "  #    ",
    "  #    ",
    "  #    "],

  ["  ##   ",
    "  ##   "]
].map(rock =>
  rock
    .map(([...bits]) =>
      bits
        .map((b, i) => (b === "#" ? 1 << (7 - i) : 0))
        .reduce((or, bit) => or | bit)
    )
    .concat([0, 0, 0])
);

const findPattern = (arr: any) => {
  const dp = arr.map((_: any) => 0);
  for (let i = 1; i < dp.length; i++) {
    let k = dp[i - 1];
    let done = false;
    while (!done) {
      if (arr[i] === arr[k]) {
        dp[i] = k + 1;
        done = true;
      } else if (k === 0) {
        dp[i] = 0;
        done = true;
      } else {
        k = dp[k - 1];
      }
    }
  }
  return arr.slice(0, arr.length - dp.at(-1));
};

const findSequence = (arr: any) => {
  const dp = Array.from({ length: arr.length + 1 }).map(_ =>
    Array(arr.length + 1).fill(0)
  );
  let seqLength = 0;
  let index = 0;
  arr.forEach((a: any, i: any) => {
    for (let j = i + 2; j <= arr.length; j++) {
      if (a === arr[j - 1] && dp[i][j - 1] < j - i) {
        dp[i + 1][j] = dp[i][j - 1] + 1;
        if (dp[i + 1][j] > seqLength) {
          seqLength = dp[i + 1][j];
          index = Math.max(i + 1, index);
        }
      } else {
        dp[i + 1][j] = 0;
      }
    }
  });
  return [
    arr.slice(index - seqLength, index),
    index - seqLength,
  ];
};

const MOVE = {
  "<": (r: any) => r << 1,
  ">": (r: any) => r >> 1,
};

export const part1 = ([...input], count = 2022) => {
  let chamber = [0b111111111];
  const lengths = [];
  let lastLength = 0;
  let rocks = 0;
  let w = 0;

  while (rocks < count) {
    let rock = ROCKS[rocks % ROCKS.length];
    // add space to chamber
    rock
      .map(_ => 0b100000001)
      .forEach(l => chamber.unshift(l));

    let landed = false;
    let h = 0;
    while (!landed) {
      const move: any = MOVE[input[w++ % input.length] as '<' | '>'];
      // check if clear to move
      if (!rock.some((r, i) => chamber[h + i] & move(r))) {
        rock = rock.map(move);
      }
      // check if collision one line down
      if (rock.some((r, i) => chamber[h + i + 1] & r)) {
        rock.forEach(
          (r, i) =>
            h + i < chamber.length && (chamber[h + i] |= r)
        );
        landed = true;
      }
      h++;
    }

    // Trim the top
    chamber = chamber.slice(
      chamber.findIndex(r => r !== 0b100000001)
    );
    // Keep track of chamber length deltas
    lengths.push(chamber.length - 1 - lastLength);
    lastLength = chamber.length - 1;

    // Some arbitrary value for part 2, not too high, not too low
    if (rocks > 5000) {
      // Find longest sequnce and its pattern
      const [sequence, seqIndex] = findSequence(lengths);
      const pattern = findPattern(sequence);
      const patternHeight = pattern.reduce((s: any, v: any) => s + v);
      const repetitions = Math.trunc(
        (count - seqIndex) / pattern.length
      );
      const rocksPostSeq =
        (count - seqIndex) % pattern.length;
      const preAndPostSeqHeight = pattern
        .slice(0, rocksPostSeq)
        .concat(lengths.slice(0, seqIndex))
        .reduce((s: any, v: any) => s + v);
      return (
        preAndPostSeqHeight + repetitions * patternHeight
      );
    }
    rocks++;
  }
  return lastLength;
};

export const part2 = (input: any) => part1(input, 1000000000000);

console.log(part2(inputs));
