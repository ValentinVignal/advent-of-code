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

const unsuccessfulStates = new Set<string>();

const stateToString = ({ a, b, c }: Registers, outputLength: number) => {
  return `${a},${b},${c},${outputLength}`;
};

// Looking at the outputs, it seems the input must finish by (base8):
// - 17
// - 36017
// - 0134036017, 0476236017, 537236017
// - 537236017
// - 510537236017 -> Dead end
// - 10537236017
// - 60510537236017, 64510537236017 -> Dead end
// - 0134036017, 0476236017, 537236017 -> Dead end
// - 36017
// - 1236017 -> Dead end
// - 36017
// - 4036017, 6236017, 7236017 -> Dead end
// - 0
// - 17, 61
// - 6017, 5661, 5761, 7761
// - 05661
// - 036017, 05661
// - 505661, 4036017
// - 4505661, 4036017
// - 34505661, 34036017
// - 134505661, 134036017

const bases = [0o0];

const startInc = 0;
let inc = startInc;
const getRegisterA = (): number => {
  const base = bases[inc % bases.length];
  const newInc = Math.floor(inc / bases.length);
  if (base === 0) return newInc;
  return base + newInc * 0o10 ** (Math.floor(Math.log(base) / Math.log(8)) + 1);
};

while (true) {
  inc++;
  const registerA = getRegisterA();
  console.log("registerA", registerA.toString(8));
  if (inc > startInc + 8 ** 6) break;

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
    programText.startsWith(outputs.join(",")) &&
    [registers.a, registers.b, registers.c].every(
      (r) => r >= 0 && Number.isInteger(r)
    )
  ) {
    if (!instructionIndex) {
      if (unsuccessfulStates.has(stateToString(registers, outputs.length))) {
        break;
      }
      visitedStates.add(stateToString(registers, outputs.length));
    }
    runInstruction();
  }

  if (getInstruction() || programText !== outputs.join(",")) {
    for (const visitedState of visitedStates) {
      unsuccessfulStates.add(visitedState);
    }
    console.log("out", outputs.join(","));
    continue;
  } else {
    break;
  }
}

console.log(getRegisterA());
