import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

const [player1, player2] = textInput.split("\n\n").map((group) => {
  return group.split("\n").slice(1).map(Number);
});

while (player1.length && player2.length) {
  const card1 = player1.shift()!;
  const card2 = player2.shift()!;

  if (card1 > card2) {
    player1.push(card1, card2);
  } else {
    player2.push(card2, card1);
  }
}

const winner = player1.length ? player1 : player2;

const result = winner.reverse().reduce((accumulator, card, index) => {
  return accumulator + card * (index + 1);
}, 0);

console.log(result); // 32179
