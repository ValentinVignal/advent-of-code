import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

let stones = textInput.split(" ").filter(Boolean).map(Number);

const blink = () => {
  stones = stones.map(evolveStone).flat();
};

const evolveStone = (stone: number): number | [number, number] => {
  if (!stone) return 1;
  const string = stone.toString();
  if (!(string.length % 2)) {
    const string1 = string.slice(0, string.length / 2);
    const string2 = string.slice(string.length / 2);
    return [parseInt(string1), parseInt(string2)];
  }
  return 2024 * stone;
};

for (let i = 0; i < 25; i++) {
  blink();
}

console.log(stones.length); // 200446
