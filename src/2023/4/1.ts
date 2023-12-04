import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Card = {
  winners: number[];
  own: number[];
};

const cards = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const sets = line
      .split(": ")[1]
      .split(" | ")
      .map((numbers) => numbers.split(" ").filter(Boolean).map(Number));
    return {
      winners: sets[0],
      own: sets[1],
    } as Card;
  });

const cardValue = (card: Card): number => {
  const n = card.own.filter((own) => card.winners.includes(own)).length;
  if (n === 0) return 0;
  return 2 ** (n - 1);
};

const points = cards.reduce((acc, card) => {
  return acc + cardValue(card);
}, 0);

console.log(points); // 23235
