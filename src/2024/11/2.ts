import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

let input = textInput.split(" ").filter(Boolean).map(Number);

/**
 * stone value: count
 */
let stones = new Map<number, number>();

for (const value of input) {
  stones.set(value, 0);
  stones.set(value, (stones.get(value) ?? 0) + 1);
}

const blink = () => {
  const newStones = new Map<number, number>();

  const evolveStone = (stone: number): [number] | [number, number] => {
    if (!stone) return [1];
    const string = stone.toString();
    if (!(string.length % 2)) {
      const string1 = string.slice(0, string.length / 2);
      const string2 = string.slice(string.length / 2);
      return [parseInt(string1), parseInt(string2)];
    }
    return [2024 * stone];
  };

  for (const stone of stones.keys()) {
    const count = stones.get(stone)!;
    const evolved = evolveStone(stone);

    for (const newStone of evolved) {
      newStones.set(newStone, (newStones.get(newStone) ?? 0) + count);
    }
  }
  stones = newStones;
};

const getCount = () =>
  [...stones.values()].reduce((acc, count) => acc + count, 0);

for (let i = 0; i < 75; i++) {
  blink();
}

console.log(getCount()); // 238317474993392
