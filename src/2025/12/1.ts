import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const blocksTextInput = textInput.split("\n\n");

const regionsTextInput = blocksTextInput[blocksTextInput.length - 1];

type Region = {
  width: number;
  height: number;
  presents: number[];
};

const regions = regionsTextInput.split("\n").map((line) => {
  const [sizePart, presentsPart] = line.split(": ");
  const [width, height] = sizePart.split("x").map(Number);
  const presents = presentsPart.split(" ").map(Number);
  return { width, height, presents } as Region;
});

const shapeArea = 7;

const filteredRegions = regions.filter((region) => {
  const presentCount = region.presents.reduce((a, b) => a + b, 0);
  const totalArea = region.width * region.height;
  return presentCount * shapeArea <= totalArea;
});

const result = filteredRegions.length;

console.log("Result:", result); // 519
