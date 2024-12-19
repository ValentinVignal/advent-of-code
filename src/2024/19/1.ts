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

const knownPossibleDesigns = new Set<string>();
const knownNotPossibleDesigns = new Set<string>();

const matchDesign = (design: string): boolean => {
  if (!design.length) return true;
  if (knownPossibleDesigns.has(design)) return true;
  if (knownNotPossibleDesigns.has(design)) return false;
  const possibleTowels = towels.filter((towel) => {
    return design.startsWith(towel);
  });

  for (const towel of possibleTowels) {
    if (matchDesign(design.slice(towel.length))) {
      knownPossibleDesigns.add(design);
      return true;
    }
  }
  knownNotPossibleDesigns.add(design);
  return false;
};

const possibleDesigns = designs.filter((design) => {
  return matchDesign(design);
});

console.log(possibleDesigns.length); // 350
