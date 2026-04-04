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

class Program {
  constructor(
    private phaseSetting: number,
    private onOutput: (output: number) => void,
    private getInput: () => number | null,
  ) {}

  private index: number = 0;

  private inputCounter: number = 0;

  private _hasHalted: boolean = false;

  get hasHalted(): boolean {
    return this._hasHalted;
  }

  run(): void {
    while (true) {
      const opCode = intCode[this.index];
      if (opCode === Instruction.Halt) {
        this._hasHalted = true;
        return;
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
        throw Error(`Unknown opCode ${opCode}, index ${this.index}`);
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
        const i1 = intCode[this.index + 1];

        const v1 = mode1 === Mode.Immediate ? i1 : intCode[i1];
        const i2 = intCode[this.index + 2];
        const v2 = mode2 === Mode.Immediate ? i2 : intCode[i2];
        const iResult = intCode[this.index + 3];

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
        this.index += 4;
      }

      if ([Instruction.Input, Instruction.Output].includes(instruction)) {
        let address = intCode[this.index + 1];
        if (instruction === Instruction.Input) {
          if (this.inputCounter === 0) {
            intCode[address] = this.phaseSetting;
            this.inputCounter++;
          } else {
            const input = this.getInput();
            if (input === null) {
              return;
            }
            intCode[address] = input;
          }
        } else {
          const mode = (Math.floor(opCode / 100) % 10) as Mode;
          let value = address;
          if (mode === Mode.Position) {
            value = intCode[value];
          }
          this.onOutput(value);
        }
        this.index += 2;
      }

      if (
        [Instruction.JumpIfTrue, Instruction.JumpIfFalse].includes(instruction)
      ) {
        const mode1 = (Math.floor(opCode / 100) % 10) as Mode;
        const mode2 = (Math.floor(opCode / 1000) % 10) as Mode;
        const i1 = intCode[this.index + 1];

        const v1 = mode1 === Mode.Immediate ? i1 : intCode[i1];
        const i2 = intCode[this.index + 2];
        const v2 = mode2 === Mode.Immediate ? i2 : intCode[i2];

        if (
          (instruction === Instruction.JumpIfTrue && !!v1) ||
          (instruction === Instruction.JumpIfFalse && !v1)
        ) {
          this.index = v2;
        } else {
          this.index += 3;
        }
      }
    }
  }
}

const runAmplifiers = (phaseSettingSequence: number[]): number => {
  /**
   * The input of a program.
   */
  const inputs = [[0], [], [], [], []];

  let outputSignal: number;

  const programs = phaseSettingSequence.map(
    (phaseSetting, index) =>
      new Program(
        phaseSetting,
        (value) => {
          if (index === 4) {
            outputSignal = value;
          }
          return inputs[(index + 1) % 5].push(value);
        },
        () => {
          const inputArray = inputs[index];
          if (inputArray.length) return inputArray.shift()!;
          return null;
        },
      ),
  );

  let programIndex = 0;

  while (programs.some((program) => !program.hasHalted)) {
    programs[programIndex].run();
    programIndex++;
    programIndex %= 5;
  }
  return outputSignal!;
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

const permutations = generatePermutations([], [5, 6, 7, 8, 9]);

let maximum = 0;
for (const phaseSequence of permutations) {
  maximum = Math.max(maximum, runAmplifiers(phaseSequence));
}

const result = maximum;

console.log(result); // 30872528
