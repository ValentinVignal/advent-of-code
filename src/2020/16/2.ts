import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const [rulesText, myTicketText, nearbyTicketsText] = textInput.split("\n\n");

type Rule = [number, number][];

const rules: Map<string, Rule> = new Map(
  rulesText.split("\n").map((line) => {
    const [name, rangesText] = line.split(": ");
    const ranges = rangesText.split(" or ").map((range) => {
      const [min, max] = range.split("-").map(Number);
      return [min, max];
    }) as Rule;
    return [name, ranges];
  })
);

type Ticket = number[];

const nearbyTickets: Ticket[] = nearbyTicketsText
  .split("\n")
  .slice(1)
  .map((line) => line.split(",").map(Number))
  .filter((ticket) => {
    return ticket.every((value) =>
      [...rules.values()].some((rule) =>
        rule.some(([min, max]) => value >= min && value <= max)
      )
    );
  });

const myTicket = myTicketText.split("\n")[1].split(",").map(Number);

const allTickets = [myTicket, ...nearbyTickets];

const possibleRulesPerPosition: Map<number, Set<string>> = new Map();

for (let position = 0; position < myTicket.length; position++) {
  const possibleRules = new Set<string>();
  for (const [name, rule] of rules) {
    let isValidForAllTickets = true;
    for (const ticket of allTickets) {
      const value = ticket[position];
      if (!rule.some(([min, max]) => value >= min && value <= max)) {
        isValidForAllTickets = false;
        break;
      }
    }
    if (isValidForAllTickets) {
      possibleRules.add(name);
    }
  }
  possibleRulesPerPosition.set(position, possibleRules);
}

const seen = new Set<string>();

const findOrdering = (): string[] => {
  const findOrderingRecursive = (current: string[]): string[] | null => {
    const key = [...current].sort().join(",");
    if (seen.has(key)) {
      return null;
    }
    seen.add(key);

    if (current.length === myTicket.length) {
      return current;
    }

    for (const name of possibleRulesPerPosition.get(current.length)!) {
      if (current.includes(name)) {
        continue;
      }
      const next = [...current, name];
      const result = findOrderingRecursive(next);
      if (result) {
        return result;
      }
    }
    return null;
  };

  return findOrderingRecursive([])!;
};

const ordering = findOrdering();

const indexes = ordering
  .map((name, index) => ({ name, index }))
  .filter(({ name }) => name.startsWith("departure"))
  .map(({ index }) => index);

const result = indexes.reduce((acc, index) => acc * myTicket[index], 1);

console.log(result); // 6766503490793
