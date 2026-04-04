import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput.split("").filter(Boolean).map(Number);

const layers: number[][] = [];

for (let i = 0; i < input.length; i += 25 * 6) {
  layers.push(input.slice(i, i + 25 * 6));
}

const minZeros = Math.min(
  ...layers.map((layer) => layer.filter((value) => value === 0).length),
);

const layer = layers.find(
  (layer) => layer.filter((value) => value === 0).length === minZeros,
)!;

const ones = layer.filter((value) => value === 1).length;
const twos = layer.filter((value) => value === 2).length;

const result = ones * twos;

console.log(result);
