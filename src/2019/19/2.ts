import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const intCode = new Map<bigint, bigint>(
  [
    ...textInput.split(",").filter(Boolean).map(Number).map(BigInt).entries(),
  ].map(([index, value]) => [BigInt(index), value]),
);

enum Mode {
  Position = 0,
  Immediate = 1,
  Relative = 2,
}

enum Instruction {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIfTrue = 5,
  JumpIfFalse = 6,
  LessThan = 7,
  Equals = 8,
  AdjustRelativeBase = 9,
  Halt = 99,
}

enum ReadType {
  Read,
  Write,
}

class Program {
  constructor(
    private intCode: Map<bigint, bigint>,
    private onOutput: (output: bigint) => Promise<void>,
    private onInput: () => Promise<bigint>,
    private halt: (() => Promise<boolean>) | null = null,
  ) {}

  private index: bigint = 0n;

  private _hasHalted: boolean = false;

  private base = 0n;

  private valueWithMode(
    value: bigint,
    mode: Mode,
    readType: ReadType = ReadType.Read,
  ): bigint {
    switch (readType) {
      case ReadType.Read:
        switch (mode) {
          case Mode.Immediate:
            return value;
          case Mode.Position:
            return this.intCode.get(value) ?? 0n;
          case Mode.Relative:
            return this.intCode.get(this.base + value) ?? 0n;
        }
      case ReadType.Write:
        switch (mode) {
          case Mode.Immediate:
            throw Error("Immediate mode not supported for write operations");
          case Mode.Position:
            return value;
          case Mode.Relative:
            return this.base + value;
        }
    }
  }

  get hasHalted(): boolean {
    return this._hasHalted;
  }

  async run(): Promise<void> {
    while (true) {
      const shouldHalt = this.halt ? await this.halt() : false;
      if (shouldHalt) {
        this._hasHalted = true;
        return Promise.resolve();
      }
      const opCode = this.intCode.get(BigInt(this.index))!;
      if (opCode === BigInt(Instruction.Halt)) {
        this._hasHalted = true;
        return Promise.resolve();
      }

      const instruction = Number(opCode % 10n) as Instruction;

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
          Instruction.AdjustRelativeBase,
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
        const mode1 = Number(
          BigInt(Math.floor(Number(opCode / 100n))) % 10n,
        ) as Mode;
        const mode2 = Number(
          BigInt(Math.floor(Number(opCode / 1000n))) % 10n,
        ) as Mode;
        const mode3 = Number(
          BigInt(Math.floor(Number(opCode / 10000n))) % 10n,
        ) as Mode;
        const i1 = this.intCode.get(this.index + 1n)!;

        const v1 = this.valueWithMode(i1, mode1);
        const i2 = this.intCode.get(this.index + 2n)!;
        const v2 = this.valueWithMode(i2, mode2);
        const iResult = this.intCode.get(this.index + 3n)!;
        const vResult = this.valueWithMode(iResult, mode3, ReadType.Write);

        let result: bigint;

        if (instruction === Instruction.Add) {
          result = v1 + v2;
        } else if (instruction === Instruction.Multiply) {
          result = v1 * v2;
        } else if (instruction === Instruction.LessThan) {
          result = v1 < v2 ? 1n : 0n;
        } else {
          result = v1 === v2 ? 1n : 0n;
        }
        this.intCode.set(vResult, result);
        this.index += 4n;
      }

      if ([Instruction.Input, Instruction.Output].includes(instruction)) {
        let address = this.intCode.get(this.index + 1n)!;
        if (instruction === Instruction.Input) {
          const mode = Number(
            BigInt(Math.floor(Number(opCode / 100n))) % 10n,
          ) as Mode;
          this.intCode.set(
            this.valueWithMode(address, mode, ReadType.Write),
            await this.onInput(),
          );
        } else {
          const mode = Number(
            BigInt(Math.floor(Number(opCode / 100n))) % 10n,
          ) as Mode;
          const value = this.valueWithMode(address, mode);
          await this.onOutput(value);
        }
        this.index += 2n;
      }

      if (
        [Instruction.JumpIfTrue, Instruction.JumpIfFalse].includes(instruction)
      ) {
        const mode1 = Number(
          BigInt(Math.floor(Number(opCode / 100n))) % 10n,
        ) as Mode;
        const mode2 = Number(
          BigInt(Math.floor(Number(opCode / 1000n))) % 10n,
        ) as Mode;
        const i1 = this.intCode.get(this.index + 1n)!;

        const v1 = this.valueWithMode(i1, mode1);
        const i2 = this.intCode.get(this.index + 2n)!;
        const v2 = this.valueWithMode(i2, mode2);

        if (
          (instruction === Instruction.JumpIfTrue && !!v1) ||
          (instruction === Instruction.JumpIfFalse && !v1)
        ) {
          this.index = v2;
        } else {
          this.index += 3n;
        }
      }

      if (instruction === Instruction.AdjustRelativeBase) {
        const mode = Number(
          BigInt(Math.floor(Number(opCode / 100n))) % 10n,
        ) as Mode;
        const value = this.valueWithMode(
          this.intCode.get(this.index + 1n)!,
          mode,
        );
        this.base += value;
        this.index += 2n;
      }
    }
  }
}

type XY = {
  x: number;
  y: number;
};

const getOutputForPosition = async ({ x, y }: XY): Promise<bigint> => {
  let result: bigint = 0n;

  let xOrY: keyof XY = "x";

  const program = new Program(
    structuredClone(intCode),
    async (output) => {
      result = output;
    },
    () => {
      if (xOrY === "x") {
        xOrY = "y";
        return Promise.resolve(BigInt(x));
      } else {
        return Promise.resolve(BigInt(y));
      }
    },
  );

  await program.run();

  return result;
};

const main = async (): Promise<void> => {
  let minX: number | undefined;
  let maxX: number | undefined;

  const maxBound = 10000;

  for (let i = 0; i <= maxBound; i++) {
    const result = await getOutputForPosition({ x: i, y: maxBound });
    if (result === 1n) {
      if (minX === undefined) {
        minX = i;
      }
    } else if (minX !== undefined && maxX === undefined) {
      maxX = i - 1;
    }

    if (minX !== undefined && maxX !== undefined) {
      break;
    }
  }

  console.log({ minX, maxX }); // { minX: 7208, maxX: 8938 }

  // Find out how long is the diagonal for y=10000 and x=minX.

  let diagonalLength = 100;

  while (true) {
    const newPosition = {
      x: minX! + diagonalLength,
      y: maxBound - diagonalLength,
    };

    const result = await getOutputForPosition(newPosition);

    if (result === 1n) {
      diagonalLength++;
    } else {
      break;
    }
  }

  console.log("diagonalLength", diagonalLength); // 914

  const calculatedY = (100 / diagonalLength) * maxBound;

  console.log("y", calculatedY); // 1094.0919037199126

  let y = Math.ceil(calculatedY);

  let topLeftCorner: XY;

  while (true) {
    console.log("y", y);
    // Find the maxX for this y.

    let maxXForY: number | undefined;
    for (let x = maxX!; 0 <= x; x--) {
      const result = await getOutputForPosition({ x, y });
      if (result === 1n) {
        maxXForY = x;
        break;
      }
    }

    // Verify the square fits.
    const bottomLeftResult = await getOutputForPosition({
      x: maxXForY! - 99,
      y: y + 99,
    });
    if (bottomLeftResult === 0n) {
      break;
    }
    topLeftCorner = { x: maxXForY! - 99, y };
    y--;
  }

  const result = 10000 * topLeftCorner!.x + topLeftCorner!.y;

  // x < 7850990 < 8691084 < 8771093
  console.log(result);
};

main();
