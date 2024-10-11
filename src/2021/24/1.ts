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

type State = {
  w: number;
  x: number;
  y: number;
  z: number;
};

const possibleDigits = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const;

let j = 0;

const cache = new Set<string>();

const toHash = (i: number, state: State): string =>
  `${i},${state.w},${state.x},${state.y},${state.z}`;

const runMonad = (i: number, n: number[], state: State): [boolean, number] => {
  j++;
  if (!(j % 100000000)) {
    console.log("j", j, "i", i, "n", n, "state", state);
  }
  if (i === instructions.length) {
    return [state.z === 0, parseInt(n.join(""))];
  }

  const instruction = instructions[i];
  if (instruction.operator === Operator.Inp) {
    const hash = toHash(i, state);
    if (cache.has(hash)) {
      return [false, 0];
    }
    for (const digit of possibleDigits) {
      const newState = structuredClone(state);
      newState[instruction.first] = digit;
      const result = runMonad(i + 1, [...n, digit], newState);
      if (result[0]) {
        return result;
      }
    }
    cache.add(hash);
    return [false, 0];
  }

  const first = state[instruction.first];
  const second = instruction.second!;
  const secondValue = typeof second === "number" ? second : state[second];
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
  state[instruction.first] = result!;
  return runMonad(i + 1, n, state);
};

const result = runMonad(0, [], { w: 0, x: 0, y: 0, z: 0 })[1];

console.log(result); // 91699394894995
