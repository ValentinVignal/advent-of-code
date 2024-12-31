import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-3" : ""}.txt`),
  "utf-8"
);

const wiresText = textInput.split("\n\n")[1];

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

let mermaidText: string[] = [];

for (const gate of gates) {
  const operationId = `${gate.input1}_${gate.operator}_${gate.input2}_${gate.output}`;
  const outputNode = `${operationId} [label="${gate.operator}" shape=box];`;

  mermaidText.push(outputNode);
  mermaidText.push(`${gate.input1} -> ${operationId};`);
  mermaidText.push(`${gate.input2} -> ${operationId};`);
  mermaidText.push(`${operationId} -> ${gate.output};`);
}

console.log(
  ["strict digraph G {", ...mermaidText.map((line) => `    ${line}`), "}"].join(
    "\n"
  )
);
