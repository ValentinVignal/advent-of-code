import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const [towelsText, designsText] = textInput.split("\n\n");

const towels = towelsText.split(", ");

const designs = designsText.split("\n").filter(Boolean);

const knownPossibleDesigns = new Map<string, number>();
const knownNotPossibleDesigns = new Set<string>();

const numberOfPossibleDesigns = (design: string): number => {
  if (!design.length) return 1;
  if (knownPossibleDesigns.has(design))
    return knownPossibleDesigns.get(design)!;
  if (knownNotPossibleDesigns.has(design)) return 0;
  const possibleTowels = towels.filter((towel) => {
    return design.startsWith(towel);
  });

  let possibleDesigns = 0;
  for (const towel of possibleTowels) {
    possibleDesigns += numberOfPossibleDesigns(design.slice(towel.length));
  }
  if (possibleDesigns > 0) {
    knownPossibleDesigns.set(design, possibleDesigns);
  } else {
    knownNotPossibleDesigns.add(design);
  }
  return possibleDesigns;
};

const possibleDesigns = designs
  .map((design) => {
    return numberOfPossibleDesigns(design);
  })
  .reduce((acc, design) => acc + design, 0);

console.log(possibleDesigns); // 769668867512623
