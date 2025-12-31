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

type Token = "(" | ")" | "+" | "*" | number;

const parseLine = (line: string): number => {
  const tokens = line
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((t) => {
      if (t === "(" || t === ")") return t;
      if (t === "+" || t === "*") return t;
      return parseInt(t);
    });

  const parseTokens = (tokens: Token[]): number => {
    if (tokens.length === 1) {
      return tokens[0] as number;
    }

    while (tokens.includes("(")) {
      const firstGroupIndex = tokens.indexOf("(");
      // Get the group content
      let depth = 1;
      let index = firstGroupIndex;
      let groupTokens: Token[] = [];
      while (depth > 0) {
        const token = tokens[++index];
        if (token === "(") {
          depth++;
        } else if (token === ")") {
          depth--;
          if (depth === 0) {
            break;
          }
        }
        groupTokens.push(token);
      }
      const groupLength = groupTokens.length;

      const groupValue = parseTokens(groupTokens);

      tokens.splice(firstGroupIndex, groupLength + 2, groupValue);
    }

    while (tokens.includes("+")) {
      const plusIndex = tokens.indexOf("+");
      const left = tokens[plusIndex - 1] as number;
      const right = tokens[plusIndex + 1] as number;
      const sum = left + right;
      tokens.splice(plusIndex - 1, 3, sum);
    }

    // Only multiplications left, evaluate left to right
    let result = tokens[0] as number;
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const right = tokens[i + 1] as number;
      if (operator === "*") {
        result = result * right;
      } else {
        throw new Error("Unexpected operator: " + operator);
      }
    }
    return result;
  };
  return parseTokens(tokens);
};

const result = textInput.split("\n").map(parseLine);

console.log(result);
const sum = result.reduce((acc, val) => acc + val, 0);

console.log(sum); // 92173009047076
