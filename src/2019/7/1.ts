import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const intCode = textInput.split(",").filter(Boolean).map(Number);

enum Mode {
  Position = 0,
  Immediate = 1,
}

enum Instruction {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIfTrue = 5,
  JumpIfFalse = 6,
  LessThan,
  Equals,
  Halt = 99,
}

const runProgram = (phaseSetting: number, input: number): number => {
  let inputCounter = 0;

  let i = 0;
  while (true) {
    const opCode = intCode[i];
    if (opCode === Instruction.Halt) {
      break;
    }

    const instruction = (opCode % 10) as Instruction;

    if (
      ![
        Instruction.Add,
        Instruction.Multiply,
        Instruction.Input,
        Instruction.Output,
        Instruction.JumpIfTrue,
        Instruction.JumpIfFalse,
        Instruction.LessThan,
        Instruction.Equals,
      ].includes(instruction)
    ) {
      throw Error(`Unknown opCode ${opCode}, index ${i}`);
    }

    if (
      [
        Instruction.Add,
        Instruction.Multiply,
        Instruction.LessThan,
        Instruction.Equals,
      ].includes(instruction)
    ) {
      const mode1 = (Math.floor(opCode / 100) % 10) as Mode;
      const mode2 = (Math.floor(opCode / 1000) % 10) as Mode;
      const i1 = intCode[i + 1];

      const v1 = mode1 === Mode.Immediate ? i1 : intCode[i1];
      const i2 = intCode[i + 2];
      const v2 = mode2 === Mode.Immediate ? i2 : intCode[i2];
      const iResult = intCode[i + 3];

      let result: number;

      if (instruction === Instruction.Add) {
        result = v1 + v2;
      } else if (instruction === Instruction.Multiply) {
        result = v1 * v2;
      } else if (instruction === Instruction.LessThan) {
        result = v1 < v2 ? 1 : 0;
      } else {
        result = v1 === v2 ? 1 : 0;
      }
      intCode[iResult] = result;
      i += 4;
    }

    if ([Instruction.Input, Instruction.Output].includes(instruction)) {
      let address = intCode[i + 1];
      if (instruction === Instruction.Input) {
        if (inputCounter === 0) {
          intCode[address] = phaseSetting;
          inputCounter++;
        } else {
          intCode[address] = input;
        }
      } else {
        const mode = (Math.floor(opCode / 100) % 10) as Mode;
        let value = address;
        if (mode === Mode.Position) {
          value = intCode[value];
        }
        return value;
      }
      i += 2;
    }

    if (
      [Instruction.JumpIfTrue, Instruction.JumpIfFalse].includes(instruction)
    ) {
      const mode1 = (Math.floor(opCode / 100) % 10) as Mode;
      const mode2 = (Math.floor(opCode / 1000) % 10) as Mode;
      const i1 = intCode[i + 1];

      const v1 = mode1 === Mode.Immediate ? i1 : intCode[i1];
      const i2 = intCode[i + 2];
      const v2 = mode2 === Mode.Immediate ? i2 : intCode[i2];

      if (
        (instruction === Instruction.JumpIfTrue && !!v1) ||
        (instruction === Instruction.JumpIfFalse && !v1)
      ) {
        i = v2;
      } else {
        i += 3;
      }
    }
  }

  throw Error("end of program with no output");
};

const runAmplifiers = (phaseSettingSequence: number[]): number => {
  let value = 0;
  for (const phaseSetting of phaseSettingSequence) {
    value = runProgram(phaseSetting, value);
  }
  return value;
};

const generatePermutations = (
  current: number[],
  remaining: number[],
): number[][] => {
  if (!remaining.length) return [current];
  const result = [];
  for (const next of remaining) {
    result.push(
      ...generatePermutations(
        [...current, next],
        remaining.filter((v) => v !== next),
      ),
    );
  }
  return result;
};

const permutations = generatePermutations([], [0, 1, 2, 3, 4]);

let maximum = 0;
for (const phaseSequence of permutations) {
  maximum = Math.max(maximum, runAmplifiers(phaseSequence));
}

const result = maximum;

console.log(result); // 70597
