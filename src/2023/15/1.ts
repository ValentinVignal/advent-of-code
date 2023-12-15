import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const steps = textInput.split("\n")[0].split(",").filter(Boolean);

const getHash = (step: string) => {
  return step.split("").reduce((acc, char) => {
    const ascii = char.charCodeAt(0);
    let value = acc + ascii;
    value *= 17;
    value %= 256;
    return value;
  }, 0);
};

const hashes = steps.map(getHash);

const result = hashes.reduce((acc, hash) => acc + hash, 0);

console.log(result); // 506891
