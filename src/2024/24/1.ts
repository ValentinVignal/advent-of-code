import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-2" : ""}.txt`),
  "utf-8"
);

const [initialValuesText, wiresText] = textInput.split("\n\n");

const values = new Map<string, number>();
for (const line of initialValuesText.split("\n").filter(Boolean)) {
  const [name, valueText] = line.split(": ");
  values.set(name, parseInt(valueText));
}

enum operator {
  Or = "OR",
  And = "AND",
  XOr = "XOR",
}

type Gate = {
  operator: operator;
  input1: string;
  input2: string;
  output: string;
};

const gates: Gate[] = wiresText
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [expressionText, output] = line.split(" -> ");
    const [input1, operator, input2] = expressionText.split(" ");
    return {
      operator: operator as operator,
      input1,
      input2,
      output,
    } as Gate;
  });

let hasUnknownValues = true;

while (hasUnknownValues) {
  hasUnknownValues = false;
  for (const gate of gates) {
    if (values.has(gate.output)) {
      continue;
    }
    if (!values.has(gate.input1) || !values.has(gate.input2)) {
      hasUnknownValues = true;
      continue;
    }
    const value1 = values.get(gate.input1)!;
    const value2 = values.get(gate.input2)!;
    let value: number;
    switch (gate.operator) {
      case operator.Or:
        value = value1 | value2;
        break;
      case operator.And:
        value = value1 & value2;
        break;
      case operator.XOr:
        value = value1 ^ value2;
        break;
    }
    values.set(gate.output, value);
  }
}

const entries = [...values.entries()]
  .filter(([key]) => key.startsWith("z"))
  .sort((a, b) => b[0].localeCompare(a[0]));

const binaryString = entries.map(([_, value]) => value).join("");

const result = parseInt(binaryString, 2);

// 4336017904887 < x
console.log(result); // 65740327379952
