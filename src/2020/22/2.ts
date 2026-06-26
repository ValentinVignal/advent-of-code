import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

const [deck1, deck2] = textInput.split("\n\n").map((group) => {
  return group.split("\n").slice(1).map(Number);
});

type Deck = number[];

enum Player {
  One = 1,
  Two = 2,
}

type State = {
  deck1: Deck;
  deck2: Deck;
};

const stateToString = (state: State): string => {
  return `${state.deck1.join(",")}-${state.deck2.join(",")}`;
};

type Result = State & {
  winner: Player;
};

const playGame = (state: State): Result => {
  let currentState = structuredClone(state);
  const visitedState = new Set<string>();

  while (true) {
    const stateKey = stateToString(currentState);
    if (visitedState.has(stateKey)) {
      return {
        ...currentState,
        winner: Player.One,
      };
    } else {
      visitedState.add(stateKey);
    }

    // We are in a brand new state.

    if (!currentState.deck1.length) {
      return { ...currentState, winner: Player.Two };
    } else if (!currentState.deck2.length) {
      return { ...currentState, winner: Player.One };
    }

    const card1 = currentState.deck1.shift()!;
    const card2 = currentState.deck2.shift()!;

    const canRecurse =
      card1 <= currentState.deck1.length && card2 <= currentState.deck2.length;
    if (canRecurse) {
      const subGameResult = playGame({
        deck1: currentState.deck1.slice(0, card1),
        deck2: currentState.deck2.slice(0, card2),
      });
      if (subGameResult.winner === Player.One) {
        currentState.deck1.push(card1, card2);
      } else {
        currentState.deck2.push(card2, card1);
      }
    } else {
      if (card1 > card2) {
        currentState.deck1.push(card1, card2);
      } else {
        currentState.deck2.push(card2, card1);
      }
    }
  }
};

const gameResult = playGame({ deck1, deck2 });

console.log(gameResult);

const winnerDeck =
  gameResult.winner === Player.One ? gameResult.deck1 : gameResult.deck2;

const result = winnerDeck.reverse().reduce((accumulator, card, index) => {
  return accumulator + card * (index + 1);
}, 0);

console.log(result); // 30498
