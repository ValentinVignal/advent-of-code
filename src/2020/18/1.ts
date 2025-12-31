import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

enum Operator {
  Addition = "+",
  Multiplication = "*",
  Group = "group",
  Literal = "literal",
}
type Literal = {
  type: Operator.Literal;
  value: number;
};

type Addition = {
  type: Operator.Addition;
  left: Expression;
  right: Expression;
};

type Multiplication = {
  type: Operator.Multiplication;
  left: Expression;
  right: Expression;
};

type Group = {
  type: Operator.Group;
  expression: Expression;
};

type Expression = Literal | Addition | Multiplication | Group;

const parseLine = (line: string): number => {
  const tokens = line
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .reverse();

  const parseTokens = (tokens: string[]): number => {
    const first = tokens.shift()!;

    if (!isNaN(parseInt(first))) {
      const firstValue = parseInt(first)!;
      if (!tokens.length) return firstValue;
      const next = tokens.shift()!;
      if (next === "+") {
        const right = parseTokens(tokens);
        return firstValue + right;
      } else if (next === "*") {
        const right = parseTokens(tokens);
        return firstValue * right;
      } else {
        throw new Error("Unexpected token: " + next);
      }
    } else {
      if (first !== ")") {
        throw new Error("Unexpected token: " + first);
      }
      // Get the group content
      let depth = 1;
      let groupTokens: string[] = [];
      while (depth > 0) {
        const token = tokens.shift()!;
        if (token === ")") {
          depth++;
        } else if (token === "(") {
          depth--;
          if (depth === 0) {
            break;
          }
        }
        groupTokens.push(token);
      }
      const groupValue = parseTokens(groupTokens);
      if (!tokens.length) return groupValue;
      const next = tokens.shift()!;
      if (next === "+") {
        const right = parseTokens(tokens);
        return groupValue + right;
      } else if (next === "*") {
        const right = parseTokens(tokens);
        return groupValue * right;
      } else {
        throw new Error("Unexpected token: " + next);
      }
    }
  };

  return parseTokens(tokens);
};

const result = textInput.split("\n").map(parseLine);

console.log(result);
const sum = result.reduce((acc, val) => acc + val, 0);

console.log(sum); // 800602729153
