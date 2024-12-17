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

let registerA = -1;
while (true) {
  registerA++;
  if (registerA % 10000000 === 0) {
    console.log("registerA", registerA);
  }

  const registers = {
    ...initialRegisters,
    a: registerA,
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
        registers.a = Math.floor(registers.a / 2 ** comboOperand);
        break;
      }
      case OperationCode.Bxl:
        registers.b ^= operand;
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
        registers.b ^= registers.c;
        break;
      case OperationCode.Out:
        outputs.push(getComboOperand() % 8);
        break;
      case OperationCode.Bdv: {
        const comboOperand = getComboOperand();
        registers.b = Math.floor(registers.a / 2 ** comboOperand);
        break;
      }
      case OperationCode.cdv: {
        const comboOperand = getComboOperand();
        registers.c = Math.floor(registers.a / 2 ** comboOperand);
        break;
      }
    }
    if (updateInstructionPointer) {
      instructionIndex++;
    }
  };

  while (
    getInstruction() &&
    programText.startsWith(outputs.join(",")) &&
    [registers.a, registers.b, registers.c].every(
      (r) => r >= 0 && Number.isInteger(r)
    )
  ) {
    runInstruction();
  }

  if (getInstruction() || programText !== outputs.join(",")) {
    continue;
  } else {
    break;
  }
}

console.log(registerA);
