import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, `input.txt`), "utf-8");

type Registers = {
  a: number;
  b: number;
  c: number;
};

enum OperationCode {
  Adv,
  Bxl,
  Bst,
  Jnz,
  Bxc,
  Out,
  Bdv,
  cdv,
}

type Instruction = {
  operation: OperationCode;
  operand: number;
};

const [registersText, instructionsText] = textInput.split("\n\n");

const [a, b, c] = registersText
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return parseInt(line.split(": ")[1]);
  });

const initialRegisters: Registers = { a, b, c };

const programText = instructionsText.split(": ")[1];
const instructions: Instruction[] = programText
  .split(/(\d\,\d)/g)
  .filter(Boolean)
  .filter((s) => s !== ",")
  .map((instructionText) => {
    const [operation, operand] = instructionText.split(",").map(Number);
    return {
      operation,
      operand,
    };
  });

const program = programText.split(",").map(Number);

const runProgram = (initialRegisterA: number): number[] => {
  const registers = {
    ...initialRegisters,
    a: initialRegisterA,
  };

  const outputs: number[] = [];

  let instructionIndex = 0;

  const getInstruction = (): Instruction | undefined => {
    return instructions[instructionIndex];
  };

  const getComboOperand = (): number => {
    const { operand } = getInstruction()!;
    if (operand <= 3) return operand;
    if (operand === 4) return registers.a;
    if (operand === 5) return registers.b;
    if (operand === 6) registers.c;
    throw new Error("Invalid operand");
  };

  const runInstruction = (): void => {
    const { operation, operand } = getInstruction()!;

    let updateInstructionPointer = true;
    switch (operation) {
      case OperationCode.Adv: {
        const comboOperand = getComboOperand();
        registers.a = Math.trunc(registers.a / 2 ** comboOperand);
        break;
      }
      case OperationCode.Bxl:
        registers.b = (registers.b ^ operand) >>> 0;
        break;
      case OperationCode.Bst: {
        const comboOperand = getComboOperand();
        registers.b = comboOperand % 8;
        break;
      }
      case OperationCode.Jnz: {
        if (registers.a !== 0) {
          updateInstructionPointer = false;
          instructionIndex = operand / 2;
        }
        break;
      }
      case OperationCode.Bxc:
        registers.b = (registers.b ^ registers.c) >>> 0;
        break;
      case OperationCode.Out:
        outputs.push(getComboOperand() % 8);
        break;
      case OperationCode.Bdv: {
        const comboOperand = getComboOperand();
        registers.b = Math.trunc(registers.a / 2 ** comboOperand);
        break;
      }
      case OperationCode.cdv: {
        const comboOperand = getComboOperand();
        registers.c = Math.trunc(registers.a / 2 ** comboOperand);
        break;
      }
    }
    if (updateInstructionPointer) {
      instructionIndex++;
    }
  };

  while (
    getInstruction() &&
    [registers.a, registers.b, registers.c].every(
      (r) => r >= 0 && Number.isInteger(r)
    )
  ) {
    runInstruction();
  }

  return outputs;
};

const visitedLeadings: number[][] = [];

const numberOfDigitsBase8 = (n: number): number =>
  Math.floor(Math.log(n) / Math.log(8)) + 1;

/**
 *
 * @param possibleLeading Different possibilities of the first n digit (base8)
 * of register A that leads to output the n last digits of the program.
 *
 */
const findRegisterA = (possibleLeading: number[]): number | null => {
  if (!possibleLeading.length) {
    const message = `No possible leading. \n\n${visitedLeadings
      .map((l) => l.map((n) => n.toString(8)).join(", "))
      .join("\n")}`;
    throw new Error(message);
  }

  visitedLeadings.push(possibleLeading);
  const possibleNewLeadings: number[] = [];
  for (const leading of possibleLeading) {
    const newLeadings = Array.from({ length: 8 }, (_, i) => 0o10 * leading + i);
    for (const newLeading of newLeadings) {
      const outputs = runProgram(newLeading);
      if (
        program.join("").endsWith(outputs.join("")) &&
        outputs.length === numberOfDigitsBase8(newLeading)
      ) {
        if (program.join("") === outputs.join("")) {
          return newLeading;
        }
        possibleNewLeadings.push(newLeading);
      }
    }
  }
  return findRegisterA(possibleNewLeadings);
};

const result = findRegisterA(Array.from({ length: 7 }, (_, i) => i + 1))!;

console.log("result", result); // 190384113204239
