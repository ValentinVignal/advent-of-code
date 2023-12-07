import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const lines = textInput.split("\n").filter(Boolean);

type Hand = {
  cards: [string, string, string, string, string];
  bid: number;
};

const hands = lines.map((line) => {
  const [cards, bid] = line.split(" ");
  return {
    cards: cards.split(""),
    bid: Number(bid),
  } as Hand;
});

const possibleCards = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

const nbCards = possibleCards.length;

const isFiveOfAKind = (hand: Hand): boolean => {
  return new Set(hand.cards).size === 1;
};

const isFourOfAKind = (hand: Hand): boolean => {
  const set = new Set(hand.cards);
  if (set.size !== 2) return false;
  const [first, second] = [...set];
  return (
    hand.cards.filter((card) => card === first).length === 4 ||
    hand.cards.filter((card) => card === second).length === 4
  );
};

const isFullHouse = (hand: Hand): boolean => {
  const set = new Set(hand.cards);
  if (set.size !== 2) return false;
  const [first, second] = [...set];
  return (
    hand.cards.filter((card) => card === first).length === 3 ||
    hand.cards.filter((card) => card === second).length === 3
  );
};

const isThreeOfKind = (hand: Hand): boolean => {
  const set = new Set(hand.cards);
  if (set.size !== 3) return false;
  const [first, second, third] = [...set];
  return (
    hand.cards.filter((card) => card === first).length === 3 ||
    hand.cards.filter((card) => card === second).length === 3 ||
    hand.cards.filter((card) => card === third).length === 3
  );
};

const isTowPair = (hand: Hand): boolean => {
  const set = new Set(hand.cards);
  return set.size === 3;
};

const isOnePair = (hand: Hand): boolean => {
  const set = new Set(hand.cards);
  return set.size === 4;
};

const cardValue = (card: string): number => possibleCards.indexOf(card);

const handRawValue = (hand: Hand): number => {
  return hand.cards.reduce((acc, card, index, array) => {
    return acc + cardValue(card) * nbCards ** (array.length - index - 1);
  }, 0);
};

const sortHand = (handA: Hand, handB: Hand): number => {
  if (isFiveOfAKind(handA) && !isFiveOfAKind(handB)) {
    return 1;
  } else if (!isFiveOfAKind(handA) && isFiveOfAKind(handB)) {
    return -1;
  } else if (isFourOfAKind(handA) && !isFourOfAKind(handB)) {
    return 1;
  }
  if (!isFourOfAKind(handA) && isFourOfAKind(handB)) {
    return -1;
  }
  if (isFullHouse(handA) && !isFullHouse(handB)) {
    return 1;
  }
  if (!isFullHouse(handA) && isFullHouse(handB)) {
    return -1;
  }
  if (isThreeOfKind(handA) && !isThreeOfKind(handB)) {
    return 1;
  }
  if (!isThreeOfKind(handA) && isThreeOfKind(handB)) {
    return -1;
  }
  if (isTowPair(handA) && !isTowPair(handB)) {
    return 1;
  }
  if (!isTowPair(handA) && isTowPair(handB)) {
    return -1;
  }
  if (isOnePair(handA) && !isOnePair(handB)) {
    return 1;
  }
  if (!isOnePair(handA) && isOnePair(handB)) {
    return -1;
  }
  return handRawValue(handB) - handRawValue(handA);
};

hands.sort(sortHand);

console.log(hands);

const total = hands.reduce(
  (acc, hand, index) => acc + hand.bid * (index + 1),
  0
);

// 249116619 < 251876849 < 252048797 < x
// x != 252025055
console.log(total); // 252052080
