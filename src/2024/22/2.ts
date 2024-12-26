import { readFileSync } from "fs";
import * as path from "path";

const example = true;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-3" : ""}.txt`),
  "utf-8"
);

const inputs = textInput.split("\n").filter(Boolean).map(Number);

const mix = (secret: number, value: number): number => (secret ^ value) >>> 0;

const prune = (secret: number): number => secret % 16777216;

const getNextSecret = (secret: number): number => {
  let result = 64 * secret;
  let nextSecret = mix(secret, result);
  nextSecret = prune(nextSecret);
  result = Math.floor(nextSecret / 32);
  nextSecret = mix(nextSecret, result);
  nextSecret = prune(nextSecret);
  result = 2048 * nextSecret;
  nextSecret = mix(nextSecret, result);
  nextSecret = prune(nextSecret);
  return nextSecret;
};

type Secret = {
  price: number;
  change: number;
};

const changesToString = (changes: number[]): string => changes.join("");

const changesScore = new Map<string, number>();

const secrets: Secret[][] = inputs.map((input) => {
  const secret: Secret[] = [];
  let previousSecret = input;
  const seenChanges = new Set<string>();
  for (let i = 0; i < 2000; i++) {
    const nextSecret = getNextSecret(previousSecret);
    const price = nextSecret % 10;
    secret.push({
      price: price,
      change: price - (previousSecret % 10),
    });
    const s = changesToString(secret.slice(i - 3, i + 1).map((s) => s.change));
    if (i >= 3 && !seenChanges.has(s)) {
      seenChanges.add(s);
      changesScore.set(s, (changesScore.get(s) ?? 0) + price);
    }
    previousSecret = nextSecret;
  }
  return secret;
});

let max = 0;
let bestSequence: number[] = [];

for (let a = -9; a <= 9; a++) {
  console.log("a", a);
  for (let b = -9; b <= 9; b++) {
    for (let c = -9; c <= 9; c++) {
      for (let d = -9; d <= 9; d++) {
        const score = secrets
          .map((secret): number => {
            for (let i = 4; i < secret.length; i++) {
              if (
                secret
                  .slice(i - 3, i + 1)
                  .every((s, j) => s.change === [a, b, c, d][j])
              ) {
                return secret[i].price;
              }
            }
            return 0;
          })
          .reduce((acc, value) => acc + value, 0);
        if (score > max) {
          max = score;
          bestSequence = [a, b, c, d];
          console.log("max", max, bestSequence);
        }
      }
    }
  }
}

console.log(max);
