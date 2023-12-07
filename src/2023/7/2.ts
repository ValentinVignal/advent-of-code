import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const lines = textInput.split("\n").filter(Boolean);

type Cards = [string, string, string, string, string];
type Hand = {
  cards: Cards;
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
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "J",
];

const replaceJoker = (hand: Hand): Hand => {
  if (!hand.cards.includes("J")) return hand;

  const mostUsedCard = [...new Set(hand.cards)]
    .filter((card) => card !== "J")
    .reduce((acc, card) => {
      if (!acc) return card;
      if (
        hand.cards.filter((c) => c === card).length >
        hand.cards.filter((c) => c === acc).length
      ) {
        return card;
      }
      return acc;
    }, "");

  return {
    ...hand,
    cards: hand.cards.map((card) =>
      card === "J" ? mostUsedCard : card
    ) as Cards,
  };
};

type EnhancedHand = Hand & {
  combinationValue: number;
  handValue: number;
};

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

const combinationValue = (hand: Hand): number => {
  const processedHand = replaceJoker(hand);
  if (isFiveOfAKind(processedHand)) {
    return 1;
  }
  if (isFourOfAKind(processedHand)) {
    return 2;
  }
  if (isFullHouse(processedHand)) {
    return 3;
  }
  if (isThreeOfKind(processedHand)) {
    return 4;
  }
  if (isTowPair(processedHand)) {
    return 5;
  }
  if (isOnePair(processedHand)) {
    return 6;
  }
  return 7;
};

const handRawValue = (hand: Hand): number => {
  return hand.cards.reduce((acc, card, index, array) => {
    return acc + cardValue(card) * nbCards ** (array.length - index - 1);
  }, 0);
};

const enhancedHands = hands.map((hand) => {
  return {
    ...hand,
    combinationValue: combinationValue(hand),
    handValue: handRawValue(hand),
  } as EnhancedHand;
});

const sortHand = (handA: EnhancedHand, handB: EnhancedHand): number => {
  if (handA.combinationValue !== handB.combinationValue)
    return handB.combinationValue - handA.combinationValue;
  return handB.handValue - handA.handValue;
};

enhancedHands.sort(sortHand);

console.log(enhancedHands);

const total = enhancedHands.reduce(
  (acc, hand, index) => acc + hand.bid * (index + 1),
  0
);

// 248102130< x < 252918728
console.log(total); // 252898370
