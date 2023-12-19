import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return Number(line.split(": ")[1]);
  });

let positions = [...input];

let scores = Array.from(input, () => 0);

let diceRollIndex = 0;

const getDiceRoll = (): number => {
  diceRollIndex++;
  return ((diceRollIndex - 1) % 100) + 1;
};

let playerIndex = 0;
while (!scores.some((score) => score >= 1000)) {
  const rolls = Array(3).fill(0).map(getDiceRoll);
  const toMove = rolls.reduce((a, b) => a + b, 0);
  const playerId = playerIndex % input.length;
  const currentPosition = positions[playerId];
  const newPosition = ((currentPosition + toMove - 1) % 10) + 1;
  positions[playerId] = newPosition;
  scores[playerId] += newPosition;

  playerIndex++;
}

const result = Math.min(...scores) * diceRollIndex;

console.log(result); // 679329
