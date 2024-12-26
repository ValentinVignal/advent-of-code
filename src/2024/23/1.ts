import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Connection = [string, string];

const input: Connection[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("-") as Connection;
  });

const connectionTexts = input.map((connection) => connection.sort().join("-"));

const allComputers = new Set<string>();

for (const connection of input) {
  allComputers.add(connection[0]);
  allComputers.add(connection[1]);
}

let count = 0;

for (let a = 0; a < allComputers.size; a++) {
  for (let b = a + 1; b < allComputers.size; b++) {
    for (let c = b + 1; c < allComputers.size; c++) {
      const [computer0, computer1, computer2] = [a, b, c].map(
        (index) => Array.from(allComputers)[index]
      );
      if (![computer0, computer1, computer2].some((c) => c.startsWith("t"))) {
        continue;
      }
      const connections = [
        [computer0, computer1],
        [computer0, computer2],
        [computer1, computer2],
      ].map((c) => c.sort().join("-"));
      if (
        connections.every((connection) => connectionTexts.includes(connection))
      ) {
        count++;
      }
    }
  }
}

console.log(count); // 1269
