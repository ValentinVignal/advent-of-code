import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return Number(line.split(": ")[1]);
  });

const positions = {
  zero: input[0],
  one: input[1],
};

type Players<T> = {
  zero: T;
  one: T;
};

const getDicePossibilities = (): number[] => {
  const possibilities: number[] = [];
  for (let dice1 = 1; dice1 <= 3; dice1++) {
    for (let dice2 = 1; dice2 <= 3; dice2++) {
      for (let dice3 = 1; dice3 <= 3; dice3++) {
        possibilities.push(dice1 + dice2 + dice3);
      }
    }
  }
  return possibilities;
};

/**
 * The current score of the game.
 */
type Score = Players<number>;

type Positions = Players<number>;

type State = {
  score: Score;
  positions: Positions;
  isPlayer0Turn: boolean;
};

const stateKey = (state: State): string => {
  return [
    state.isPlayer0Turn,
    state.positions.zero,
    state.positions.one,
    state.score.zero,
    state.score.one,
  ].join("-");
};

const cache = new Map<string, WinsCount>();

type WinsCount = Players<number>;

const computeWinsCount = (state: State): WinsCount => {
  const key = stateKey(state);
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  if (state.score.zero >= 21) {
    return {
      zero: 1,
      one: 0,
    };
  } else if (state.score.one >= 21) {
    return {
      zero: 0,
      one: 1,
    };
  }

  // No one won.

  const dicePossibilities = getDicePossibilities();

  const winsCounts = dicePossibilities.map((dice) => {
    const newState = structuredClone(state);
    const isPlayer0Turn = newState.isPlayer0Turn;
    let position: number;
    newState.isPlayer0Turn = !isPlayer0Turn;
    if (isPlayer0Turn) {
      position = newState.positions.zero;
    } else {
      position = newState.positions.one;
    }
    position = ((position + dice - 1) % 10) + 1;
    if (isPlayer0Turn) {
      newState.positions.zero = position;
      newState.score.zero += position;
    } else {
      newState.positions.one = position;
      newState.score.one += position;
    }
    return computeWinsCount(newState);
  });

  const winsCount: WinsCount = winsCounts.reduce(
    (a, b) => ({
      zero: a.zero + b.zero,
      one: a.one + b.one,
    }),
    { zero: 0, one: 0 }
  );
  cache.set(key, winsCount);
  return winsCount;
};

const winsCount = computeWinsCount({
  isPlayer0Turn: true,
  score: {
    zero: 0,
    one: 0,
  },
  positions,
});

const result = Math.max(winsCount.zero, winsCount.one);

console.log(result);
