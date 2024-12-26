import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
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

const newSecrets: number[] = [];
for (const input of inputs) {
  let nextSecret = input;
  for (let i = 0; i < 2000; i++) {
    nextSecret = getNextSecret(nextSecret);
  }
  newSecrets.push(nextSecret);
}

const result = newSecrets.reduce((acc, cur) => acc + cur, 0);

console.log(result); // 12759339434
