import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const [rulesText, _, nearbyTicketsText] = textInput.split("\n\n");

type Rule = [number, number][];

const rules: Rule[] = rulesText.split("\n").map((line) => {
  return line
    .split(": ")[1]
    .split(" or ")
    .map((range) => {
      const [min, max] = range.split("-").map(Number);
      return [min, max];
    });
});

type Ticket = number[];

const nearbyTickets: Ticket[] = nearbyTicketsText
  .split("\n")
  .slice(1)
  .map((line) => line.split(",").map(Number));

let errorRate = 0;

for (const ticket of nearbyTickets) {
  for (const value of ticket) {
    if (
      !rules.some((rule) =>
        rule.some(([min, max]) => value >= min && value <= max)
      )
    ) {
      errorRate += value;
    }
  }
}

console.log(errorRate); // 24110
