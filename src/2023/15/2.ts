import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Operation = "-" | "=";

type Step = {
  operation: Operation;
  label: string;
  hash: number;
} & ({ operation: "-"; value: null } | { operation: "="; value: number });

const regexp = /^(\w)+/;

const getHash = (step: string) => {
  return step.split("").reduce((acc, char) => {
    const ascii = char.charCodeAt(0);
    let value = acc + ascii;
    value *= 17;
    value %= 256;
    return value;
  }, 0);
};

const steps: Step[] = textInput
  .split("\n")[0]
  .split(",")
  .filter(Boolean)
  .map((step) => {
    const label = step.match(regexp)![0];
    const operation = step.replace(label, "")[0] as Operation;
    const value = operation === "-" ? null : parseInt(step.split("=")[1]);
    return {
      label,
      hash: getHash(label),
      operation,
      value,
    } as Step;
  });

const boxes: Step[][] = Array.from({ length: 256 }, () => []);

for (const step of steps) {
  let box = boxes[step.hash];
  switch (step.operation) {
    case "-":
      boxes[step.hash] = box.filter((item) => item.label !== step.label);
      break;

    case "=":
      const index = box.findIndex((item) => item.label === step.label);
      if (index !== -1) {
        box[index] = step;
      } else {
        box.push(step);
      }
      break;
  }
  // printBoxes(boxes);
}

const result = boxes
  .map((box, boxIndex) => {
    return box.map(
      (lens, lensIndex) => (boxIndex + 1) * (lensIndex + 1) * lens.value!
    );
  })
  .flat()
  .reduce((acc, value) => acc + value, 0);

console.log(result); // 230462
