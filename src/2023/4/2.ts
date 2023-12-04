import { readFileSync } from "fs";
import * as path from "path";
import { sum } from "../../utils/array";

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
  return card.own.filter((own) => card.winners.includes(own)).length;
};

const points = cards.map((card) => {
  return cardValue(card);
});

const cardNumbers = Array(cards.length).fill(1);

for (const [index, point] of points.entries()) {
  for (let di = 1; di < point + 1; di++) {
    if (index + di >= cardNumbers.length) continue;
    cardNumbers[index + di] += cardNumbers[index];
  }
}

const total = sum(cardNumbers);

// x != 1344440651
console.log(total); // 5920640
