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

const stateToString = ({ a, b, c }: Registers, outputLength: number) => {
  return `${a},${b},${c},${outputLength}`;
};

// Looking at the outputs, it seems the input must start with by (base8):
// - 5
// - 53, 57
// - 532, 572
// - 5322, 5722, 5325
// - 53223, 57223, 53257
// - 532235, 572235, 532577 -> Dead end
// - 53223, 57223, 53257
// - 532235
// - 5322350
// - 53223501, 532235014
// - 532235013, 532235016 -> Retry ?
// - 5322350134, 5322350135, 5322350137
// - 53223501340, 53223501342, 53223501352, 53223501372, 53223501345, 53223501355, 53223501375, 53223501346, 53223501356, 53223501347, 53223501357, 53223501377
// - 532235013403, 532235013423, 532235013523, 532235013723, 532235013463, 532235013563, 532235013725, 532235013755, 532235013775
// - 5322350134036, 5322350134236, 5322350135236, 5322350137236, 5322350134636, 5322350135636
// - 53223501340360, 53223501342360, 53223501352360, 53223501372360, 53223501346360, 53223501356360, 53223501340361, 53223501340365, 53223501342365, 53223501352365, 53223501372365, 53223501346365, 53223501356365 -> Dead end
//
// - 5322350164, 5322350165
// - 53223501640, 53223501642, 5322350165
// - 532235016403, 532235016423, 532235016523
// - 5322350164036, 5322350164236, 5322350165236
// - 53223501640360, 53223501642360, 53223501652360

const bases = [0o53223501, 0o53223501, 0o53223501];

const startInc = -1;
let inc = startInc;
const getRegisterA = (): number => {
  const base = bases[inc % bases.length];
  const newInc = Math.floor(inc / bases.length);
  if (base === 0) return newInc;
  return (
    base *
      0o10 ** ((!newInc ? 0 : Math.floor(Math.log(newInc) / Math.log(8))) + 1) +
    newInc
  );
};

while (true) {
  inc++;
  const registerA = getRegisterA();
  console.log("registerA", registerA.toString(8));
  if (inc > startInc + 8 ** 6 * bases.length) break;

  const registers = {
    ...initialRegisters,
    a: registerA,
  };

  const visitedStates = new Set<string>();

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
    [registers.a, registers.b, registers.c].every(
      (r) => r >= 0 && Number.isInteger(r)
    )
  ) {
    if (!instructionIndex) {
      visitedStates.add(stateToString(registers, outputs.length));
    }
    runInstruction();
  }

  if (getInstruction() || programText !== outputs.join(",")) {
    console.log("out", outputs.join(","));
    continue;
  } else {
    break;
  }
}

console.log(getRegisterA());
