import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
};

type Operator = "<" | ">";

type WorkflowStep = {
  part: keyof Part;
  operator: Operator;
  value: number;
  next: string;
};

type Workflow = {
  name: string;
  conditions: WorkflowStep[];
  fallback: string;
};

const [workflowText, partsText] = textInput.split("\n\n");

const parts = partsText
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    let formattedLine = line.replaceAll("=", ":");
    for (const key of "xmas") {
      formattedLine = formattedLine.replaceAll(key, `"${key}"`);
    }
    return JSON.parse(formattedLine) as Part;
  });

const workflows = new Map<string, Workflow>();

workflowText
  .split("\n")
  .filter(Boolean)
  .forEach((line) => {
    const [name, restText] = line.split("{");
    const stepTexts = restText.split("}")[0].split(",");
    const fallback = stepTexts[stepTexts.length - 1];
    const conditions: WorkflowStep[] = stepTexts
      .slice(0, -1)
      .map((stepText) => {
        const [conditionText, next] = stepText.split(":");
        const operator = stepText.includes("<") ? "<" : ">";
        const [part, valueText] = conditionText.split(operator);
        return {
          part: part as keyof Part,
          operator,
          value: Number(valueText),
          next,
        };
      });
    workflows.set(name, {
      name,
      conditions,
      fallback,
    });
  });

const acceptedParts: Part[] = [];

for (const part of parts) {
  let currentWorkflowName = "in";

  while (!["A", "R"].includes(currentWorkflowName)) {
    const workflow = workflows.get(currentWorkflowName)!;
    let newWorkflowName: string | null = null;
    for (const condition of workflow.conditions) {
      if (condition.operator === "<") {
        if (part[condition.part] < condition.value) {
          newWorkflowName = condition.next;
          break;
        }
      } else {
        if (part[condition.part] > condition.value) {
          newWorkflowName = condition.next;
          break;
        }
      }
    }
    newWorkflowName ??= workflow.fallback;
    currentWorkflowName = newWorkflowName;
  }

  if (currentWorkflowName === "A") {
    acceptedParts.push(part);
  }
}

const result = acceptedParts.reduce((acc, part) => {
  let value = 0;
  for (const key of "xmas") {
    value += part[key as keyof Part];
  }
  return acc + value;
}, 0);

console.log(result);
