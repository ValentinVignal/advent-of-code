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
  const outputNode = `${gate.output}(${gate.operator} - ${gate.output})`;
  mermaidText.push(`${gate.input1} --> ${outputNode}`);
  mermaidText.push(`${gate.input2} --> ${outputNode}`);
}

console.log(mermaidText.map((line) => `  ${line}`).join("\n"));
