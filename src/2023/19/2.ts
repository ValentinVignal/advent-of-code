import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Part = {
  x: Range;
  m: Range;
  a: Range;
  s: Range;
};

type Operator = "<" | ">";

type Range = {
  start: number;
  end: number;
};

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

const workflowText = textInput.split("\n\n")[0];

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

type StepWithPart = {
  step: string;
  part: Part;
};

const cache = new Map<string, number>();

const partToKey = (part: StepWithPart): string => {
  return `${part.step}-${part.part.x.start}-${part.part.x.end}-${part.part.m.start}-${part.part.m.end}-${part.part.a.start}-${part.part.a.end}-${part.part.s.start}-${part.part.s.end}`;
};

const getAllCount = (part: Part): number => {
  return (
    (part.x.end - part.x.start + 1) *
    (part.m.end - part.m.start + 1) *
    (part.a.end - part.a.start + 1) *
    (part.s.end - part.s.start + 1)
  );
};

const splitPart = (
  part: Part,
  condition: WorkflowStep
): { verified: Part; notVerified: Part } => {
  const verified = structuredClone(part);
  const notVerified = structuredClone(part);

  if (condition.operator === "<") {
    verified[condition.part].end = condition.value - 1;
    notVerified[condition.part].start = condition.value;
  } else {
    verified[condition.part].start = condition.value + 1;
    notVerified[condition.part].end = condition.value;
  }

  return { verified, notVerified };
};

const getAcceptedCount = (part: StepWithPart): number => {
  const key = partToKey(part);
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const allCount = getAllCount(part.part);
  if (allCount === 0) return 0;

  let acc = 0;

  if (part.step === "R") {
    return 0;
  } else if (part.step === "A") {
    return allCount;
  }

  const workflow = workflows.get(part.step)!;
  let remainingPart = structuredClone(part.part);
  for (const condition of workflow.conditions) {
    const range = remainingPart[condition.part];
    if (condition.value <= range.start || range.end <= condition.value) {
      continue;
    }
    // This will split the range in 2;
    const { verified, notVerified } = splitPart(remainingPart, condition);
    acc += getAcceptedCount({ step: condition.next, part: verified });
    remainingPart = notVerified;
  }
  acc += getAcceptedCount({ step: workflow.fallback, part: remainingPart });
  return acc;
};

const result = getAcceptedCount({
  step: "in",
  part: {
    x: { start: 1, end: 4000 },
    m: { start: 1, end: 4000 },
    a: { start: 1, end: 4000 },
    s: { start: 1, end: 4000 },
  },
});

console.log(result); // 132557544578569
