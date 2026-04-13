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
    private onOutput: (output: bigint) => void,
    private onInput: () => bigint,
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
            return intCode.get(value) ?? 0n;
          case Mode.Relative:
            return intCode.get(this.base + value) ?? 0n;
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

  run(): void {
    while (true) {
      const opCode = intCode.get(BigInt(this.index))!;
      if (opCode === BigInt(Instruction.Halt)) {
        this._hasHalted = true;
        return;
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
        const i1 = intCode.get(this.index + 1n)!;

        const v1 = this.valueWithMode(i1, mode1);
        const i2 = intCode.get(this.index + 2n)!;
        const v2 = this.valueWithMode(i2, mode2);
        const iResult = intCode.get(this.index + 3n)!;
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
        intCode.set(vResult, result);
        this.index += 4n;
      }

      if ([Instruction.Input, Instruction.Output].includes(instruction)) {
        let address = intCode.get(this.index + 1n)!;
        if (instruction === Instruction.Input) {
          const mode = Number(
            BigInt(Math.floor(Number(opCode / 100n))) % 10n,
          ) as Mode;
          intCode.set(
            this.valueWithMode(address, mode, ReadType.Write),
            this.onInput(),
          );
        } else {
          const mode = Number(
            BigInt(Math.floor(Number(opCode / 100n))) % 10n,
          ) as Mode;
          const value = this.valueWithMode(address, mode);
          this.onOutput(value);
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
        const i1 = intCode.get(this.index + 1n)!;

        const v1 = this.valueWithMode(i1, mode1);
        const i2 = intCode.get(this.index + 2n)!;
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
        const value = this.valueWithMode(intCode.get(this.index + 1n)!, mode);
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

const xyToString = (xy: XY): string => {
  return `${xy.x},${xy.y}`;
};

enum OutputType {
  Paint,
  Turn,
}

enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

class PaintRobot {
  constructor() {}

  private map = new Map<string, bigint>();

  private position: XY = { x: 0, y: 0 };
  private direction = Direction.Up;

  private nextOutputType: OutputType = OutputType.Paint;

  program = new Program(
    (output) => {
      if (this.nextOutputType === OutputType.Paint) {
        this.map.set(xyToString(this.position), output);
        this.nextOutputType = OutputType.Turn;
      } else {
        if (output === 0n) {
          this.direction = (this.direction + 1) % 4;
        } else {
          this.direction = (this.direction + 3) % 4;
        }
        switch (this.direction) {
          case Direction.Up:
            this.position.y++;
            break;
          case Direction.Right:
            this.position.x++;
            break;
          case Direction.Down:
            this.position.y--;
            break;
          case Direction.Left:
            this.position.x--;
            break;
        }
        this.nextOutputType = OutputType.Paint;
      }
    },
    () => {
      const key = xyToString(this.position);
      if (!this.map.has(key)) {
        return 0n;
      }
      return this.map.get(key)!;
    },
  );

  run(): void {
    this.program.run();
  }

  get paintCount(): number {
    return this.map.size;
  }
}

const paintRobot = new PaintRobot();

paintRobot.run();

const result = paintRobot.paintCount;

console.log(result);
