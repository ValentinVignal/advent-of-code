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
  n: bigint;
};

type ShuffleDealWithIncrement = {
  technic: Technic.DealWithIncrement;
  n: bigint;
};

type Shuffle =
  | {
      technic: Technic.DealIntoNewStack;
    }
  | ShuffleCut
  | ShuffleDealWithIncrement;

const shuffles: Shuffle[] = textInput.split("\n").map((line) => {
  if (line.startsWith("cut")) {
    const n = BigInt(parseInt(line.split(" ")[1]));
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

  const n = BigInt(parseInt(line.split("deal with increment ")[1]));
  return {
    technic: Technic.DealWithIncrement,
    n,
  };
});

const cardCount = 119315717514047n;
const totalShuffles = 101741582076661n;

// All shuffles are a linear transformation y = ax + b.

let a = 1n;
let b = 0n;

// Go through all the different shuffles and modify a and b accordingly. This
// will give us
// ```
// shuffle(x) = a * x + b
// ```
// for the entire shuffle instructions.

for (const shuffle of shuffles) {
  switch (shuffle.technic) {
    case Technic.DealIntoNewStack:
      // This reverses the pile. So its formula is
      // ```
      // y = cardCount - 1 - x
      // ```
      // Hence
      // ```
      // s(x) = cardCount - 1 - (a * x + b)
      //      = -a * x + cardCount - 1 - b
      // ```
      a = -a;
      b = (cardCount - 1n - b) % cardCount;
      break;
    case Technic.Cut:
      // ```
      // y = x - n
      // ```
      // Hence
      // ```
      // s(x) = a * x + b - n
      // ```
      b = (b - shuffle.n) % cardCount;
      break;
    case Technic.DealWithIncrement:
      // ```
      // y = n * x
      // ```
      // Hence
      // ```
      // s(x) = n * (a * x + b)
      //      = (a * n) * x + (b * n)
      // ```
      a = (a * shuffle.n) % cardCount;
      b = (b * shuffle.n) % cardCount;
      break;
  }
}

console.log({ a, b });

// We now have `shuffle(x) = s(x) = a * x + b`
// We do this operation 101741582076661 times:
// ```
// completeShuffle(x) = s(s(s(...s(x)))) = s o s o s ... s o
// ```
// which is also linear:
// ```
// completeShuffle(x) = c * x + d
// ```
// cs(x) = a ^ totalShuffles * x + b + b * a + b * a^ 2 + ... + b * a^(totalShuffles - 1)
//       = a ^ totalShuffles * x + b * (1 + a + a^2 + ... + a^(totalShuffles - 1))
//       = a ^ totalShuffles * x + b * (a^totalShuffles - 1) / (a - 1)
// ```

const powModulo = (base: bigint, exponent: bigint, modulo: bigint): bigint => {
  let result = 1n;
  let current = base % modulo;
  let e = exponent;
  while (e > 0) {
    if (e % 2n === 1n) {
      result = (result * current) % modulo;
    }
    current = (current * current) % modulo;
    e = e / 2n;
  }
  return result;
};

const divideModulo = (a: bigint, b: bigint, modulo: bigint): bigint => {
  // We want to find x such that (b * x) % modulo === a
  // This is the same as finding the modular inverse of b anj then multiplying it by a.
  const modInverse = powModulo(b, modulo - 2n, modulo); // Fermat's little theorem
  return (a * modInverse) % modulo;
};

const c = powModulo(a, totalShuffles, cardCount);
const d = divideModulo(
  b * (powModulo(a, totalShuffles, cardCount) - 1n),
  a - 1n,
  cardCount,
);

console.log({ c, d });

// We now have
// ```
// completeShuffle(x) = c * x + d
// ```

// We want to know which card ends up in position 2020, so we need to solve
// ```
// 2020 = y = c * x + d
//
// x = (y - d) / c
// ```
const result = divideModulo(2020n - d, c, cardCount);

// x != 92365370183771
console.log("result", result); // 78613970589919
