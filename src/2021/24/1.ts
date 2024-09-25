import { readFileSync } from "fs";
import path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const variables = ["w", "x", "y", "z"] as const;
type Variable = (typeof variables)[number];

enum Operator {
  Inp = "inp",
  Add = "add",
  Mul = "mul",
  Div = "div",
  Mod = "mod",
  Eql = "eql",
}

type Instruction = {
  operator: Operator;
  first: Variable;
  second?: Variable | number;
};

const instructions = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const s = line.split(" ").filter(Boolean);
    const hasSecond = s.length === 3;
    const isNumber = hasSecond && !variables.includes(s[2] as Variable);

    const instruction: Instruction = {
      operator: s[0] as Operator,
      first: s[1] as Variable,
    };
    if (hasSecond) {
      instruction.second = isNumber ? parseInt(s[2]) : (s[2] as Variable);
    }
    return instruction;
  });

let biggestNumber = 1e14 - 1;

const indexOfZero = (n: number): number => {
  return n.toString().indexOf("0");
};

const runMonad = (n: number): boolean => {
  const memory = new Map<Variable, number>();
  for (const variable of variables) {
    memory.set(variable, 0);
  }

  const inputs = n
    .toString()
    .split("")
    .map((s) => parseInt(s));

  for (const instruction of instructions) {
    if (instruction.operator === Operator.Inp) {
      memory.set(instruction.first, inputs.shift()!);
      continue;
    }
    const first = memory.get(instruction.first)!;
    const second = instruction.second!;
    const secondValue =
      typeof second === "number" ? second : memory.get(second)!;
    let result: number;
    switch (instruction.operator) {
      case Operator.Add:
        result = first + secondValue;
        break;
      case Operator.Mul:
        result = first * secondValue;
        break;
      case Operator.Eql:
        result = Number(first === secondValue);
        break;
      case Operator.Mod:
        result = first % secondValue;
        break;
      case Operator.Div:
        result = Math.trunc(first / secondValue);
        break;
    }
    memory.set(instruction.first, result!);
  }
  return memory.get("z")! === 0;
};

let i = 0;
while (true) {
  i++;
  if (!(i % 1000000)) {
    console.log(i, biggestNumber);
  }
  const index = indexOfZero(biggestNumber);
  if (index !== -1) {
    biggestNumber -= 10 ** (13 - index);
    continue;
  }
  if (runMonad(biggestNumber)) {
    break;
  }
  biggestNumber--;
}

console.log(biggestNumber);
