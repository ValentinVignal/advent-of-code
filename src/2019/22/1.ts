import { readFileSync } from "node:fs";
import * as path from "node:path";

let example = 0;

const textInput = readFileSync(
  path.join(
    __dirname,
    `input${example ? `-example${example > 1 ? `-${example}` : ""}` : ""}.txt`,
  ),
  "utf-8",
);

enum Technic {
  DealIntoNewStack,
  Cut,
  DealWithIncrement,
}

type ShuffleCut = {
  technic: Technic.Cut;
  n: number;
};

type ShuffleDealWithIncrement = {
  technic: Technic.DealWithIncrement;
  n: number;
};

type Shuffle =
  | {
      technic: Technic.DealIntoNewStack;
    }
  | ShuffleCut
  | ShuffleDealWithIncrement;

const shuffles: Shuffle[] = textInput.split("\n").map((line) => {
  if (line.startsWith("cut")) {
    const n = parseInt(line.split(" ")[1]);
    return {
      technic: Technic.Cut,
      n,
    };
  }
  if (line === "deal into new stack") {
    return {
      technic: Technic.DealIntoNewStack,
    };
  }

  const n = parseInt(line.split("deal with increment ")[1]);
  return {
    technic: Technic.DealWithIncrement,
    n,
  };
});

let cards: number[] = Array.from({ length: example ? 10 : 10007 }, (_, i) => i);

const dealIntoNewStack = (card: number[]): number[] => {
  return card.reverse();
};

const cut = (cards: number[], shuffle: ShuffleCut): number[] => {
  const first = cards.slice(0, shuffle.n);
  return [...cards.slice(shuffle.n), ...first];
};

const dealWithIncrement = (
  cards: number[],
  shuffle: ShuffleDealWithIncrement,
): number[] => {
  const newCards = Array.from({ length: cards.length }, () => 0);
  for (let i = 0; i < cards.length; i++) {
    const newIndex = (i * shuffle.n) % cards.length;
    newCards[newIndex] = cards[i];
  }
  return newCards;
};

const shuffleCards = (cards: number[], shuffle: Shuffle): number[] => {
  switch (shuffle.technic) {
    case Technic.DealIntoNewStack:
      return dealIntoNewStack(cards);
    case Technic.Cut:
      return cut(cards, shuffle);
    case Technic.DealWithIncrement:
      return dealWithIncrement(cards, shuffle);
  }
};

for (const shuffle of shuffles) {
  cards = shuffleCards(cards, shuffle);
}

const result = cards.indexOf(2019);

// x < 9209
console.log(result); // 4096
