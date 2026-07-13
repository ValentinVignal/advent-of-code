import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Cups = number[];

const cups: Cups = textInput.split("").filter(Boolean).map(Number);

type State = {
  cups: Cups;
  currentIndex: number;
};

const doMove = (state: State): State => {
  const cups = state.cups.slice();
  const currentValue = state.cups[state.currentIndex];

  // Pick
  const picked = cups.splice(state.currentIndex + 1, 3);
  if (picked.length !== 3) {
    picked.push(...cups.splice(0, 3 - picked.length));
  }
  console.log("picked", picked.join(""), "remains", cups.join(""));

  // Destination
  let destinationValue = currentValue - 1;
  while (!cups.includes(destinationValue)) {
    destinationValue--;
    if (destinationValue <= 0) {
      destinationValue = state.cups.length;
    }
  }
  const destinationValueIndex = cups.indexOf(destinationValue);

  cups.splice((destinationValueIndex + 1) % state.cups.length, 0, ...picked);

  return {
    cups,
    currentIndex: (cups.indexOf(currentValue) + 1) % state.cups.length,
  };
};

let state: State = {
  cups,
  currentIndex: 0,
};

for (let i = 0; i < (example ? 10 : 100); i++) {
  console.log(
    "for loop",
    i,
    "cups",
    state.cups.join(""),
    "currentIndex",
    state.currentIndex,
    "currentValue",
    state.cups[state.currentIndex],
  );
  state = doMove(state);
}

const indexOf1 = state.cups.indexOf(1);

const result =
  state.cups.slice(indexOf1 + 1).join("") +
  state.cups.slice(0, indexOf1).join("");

// x < 129675348
console.log(result); // 52864379
