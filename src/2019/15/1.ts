import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const intCode = new Map<bigint, bigint>(
  [
    ...textInput.split(",").filter(Boolean).map(Number).map(BigInt).entries(),
  ].map(([index, value]) => [BigInt(index), value]),
);

intCode.set(0n, 2n);

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
  x: bigint;
  y: bigint;
};

const xyToString = ({ x, y }: XY): string => {
  return `${x},${y}`;
};

enum OutputType {
  Wall = 0,
  Empty = 1,
  OxygenSystem = 2,
}

enum Movement {
  North = 1,
  South = 2,
  West = 3,
  East = 4,
}

class DepthSearchNode<T> {
  constructor(public value?: T) {}

  private children: DepthSearchNode<T>[] = [];

  get hasChildren(): boolean {
    return !!this.children.length;
  }

  pop(): T | null {
    if (!this.children.length) {
      return null;
    }
    const last = this.children[this.children.length - 1];
    if (last.hasChildren) {
      return last.pop();
    } else {
      this.children.pop();
      return last.value!;
    }
  }

  add(children: T[]): void {
    if (!this.children.length) {
      this.children.push(
        ...children.map((child) => {
          return new DepthSearchNode(child);
        }),
      );
    } else {
      this.children[this.children.length - 1].add(children);
    }
  }
}

class DepthSearchTree<T> extends DepthSearchNode<T> {
  constructor() {
    super();
  }
}

class HaltError extends Error {
  constructor() {
    super();
  }
}

class RepairDroid {
  constructor() {}

  private grid = new Map<string, OutputType>();

  private depthSearchTree = new DepthSearchTree<Movement>();

  private lastMove: Movement | null = null;
  private position: XY = { x: 0n, y: 0n };

  program = new Program(
    (output) => {
      const newPosition = structuredClone(this.position);
      switch (this.lastMove!) {
        case Movement.North:
          newPosition.y--;
          break;
        case Movement.South:
          newPosition.y++;
          break;
        case Movement.West:
          newPosition.x--;
          break;
        case Movement.East:
          newPosition.x++;
          break;
      }
      const key = xyToString(newPosition);
      const effectiveOutput = Number(output) as OutputType;
      this.grid.set(key, effectiveOutput);
      switch (effectiveOutput) {
        case OutputType.Wall:
          break; // Cannot move
        case OutputType.Empty:
        case OutputType.OxygenSystem:
          this.position = newPosition;
          this.depthSearchTree.add([
            Movement.North,
            Movement.South,
            Movement.West,
            Movement.East,
          ]);
      }
    },
    () => {
      this.lastMove = this.depthSearchTree.pop();

      if (!this.lastMove) {
        throw new HaltError();
      }
      return BigInt(this.lastMove);
    },
  );

  explore(): void {
    try {
      this.program.run();
    } catch (error) {
      if (!(error instanceof HaltError)) {
        throw error;
      }
    }
  }

  get shortestPathToOxygenSystem(): number {
    return 0;
  }
}

const game = new RepairDroid();

game.explore();

const result = game.shortestPathToOxygenSystem;

console.log(result); //
