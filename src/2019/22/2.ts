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

const length = 119315717514047;

const reverseDealIntoNewStack = (index: number): number => {
  return length - index - 1;
};

const reverseCut = (index: number, shuffle: ShuffleCut): number => {
  if (index <= length - shuffle.n) {
    return shuffle.n + index;
  } else {
    return index - (length - shuffle.n);
  }
};

const modInverse = (a: number, m: number): number => {
  const m0 = m;
  let x0 = 0;
  let x1 = 1;

  if (m === 1) {
    return 0;
  }

  while (a > 1) {
    const q = Math.floor(a / m);
    let t = m;

    m = a % m;
    a = t;
    t = x0;

    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0) {
    x1 += m0;
  }

  return x1;
};

const reverseDealWithIncrement = (
  index: number,
  { n }: ShuffleDealWithIncrement,
): number => {
  // inverse so (n * inverse) % length === 1
  const inverse = modInverse(n, length);

  return (index * inverse) % length;
};

const reverse = (index: number, shuffle: Shuffle): number => {
  switch (shuffle.technic) {
    case Technic.DealIntoNewStack:
      return reverseDealIntoNewStack(index);
    case Technic.Cut:
      return reverseCut(index, shuffle);
    case Technic.DealWithIncrement:
      return reverseDealWithIncrement(index, shuffle);
  }
};

let index = 2020;
for (const shuffle of shuffles.reverse()) {
  index = reverse(index, shuffle);
}

const result = index;

// 34709086645976 < 71591241947733 < x
console.log(result); //
