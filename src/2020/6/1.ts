import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const answers = textInput.split("\n\n").map((group) => {
  return group.split("\n");
});

const result = answers
  .map((group) => {
    const set = new Set<string>();
    for (const line of group) {
      for (const char of line) {
        set.add(char);
      }
    }
    return set.size;
  })
  .reduce((a, b) => a + b, 0);

console.log(result); // 6748
