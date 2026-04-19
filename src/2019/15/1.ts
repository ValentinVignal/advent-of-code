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

  async run(): Promise<void> {
    while (true) {
      const shouldHalt = this.halt ? await this.halt() : false;
      if (shouldHalt) {
        this._hasHalted = true;
        return Promise.resolve();
      }
      const opCode = intCode.get(BigInt(this.index))!;
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

class AwaitablePromise<T> {
  private promise: Promise<T>;

  private resolveFunction!: (value: T) => void;

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolveFunction = resolve;
    });
  }

  resolve(value: T): void {
    this.resolveFunction(value);
  }

  await(): Promise<T> {
    return this.promise;
  }
}

class RepairDroid {
  constructor() {}

  private awaitNextInputPromise = new AwaitablePromise<Movement>();
  private outputPromise = new AwaitablePromise<OutputType>();

  private shouldHalt = false;

  program = new Program(
    async (output) => {
      this.outputPromise.resolve(Number(output) as OutputType);
      this.outputPromise = new AwaitablePromise<OutputType>();
    },
    async () => {
      const movement = await this.awaitNextInputPromise.await();
      this.awaitNextInputPromise = new AwaitablePromise<Movement>();

      return BigInt(movement);
    },
    async () => this.shouldHalt,
  );

  async explore(): Promise<void> {
    const grid = new Map<string, OutputType>();
    const stack = [];
    for (const movement of [
      Movement.North,
      Movement.South,
      Movement.West,
      Movement.East,
    ]) {
      stack.push(movement);
    }

    let position: XY = { x: 0n, y: 0n };

    while (stack.length) {
      const movement = stack.pop()!;
      const outputType = await this.move(movement);
      const newPosition = structuredClone(position);
      switch (movement) {
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
      grid.set(key, outputType);
      switch (outputType) {
        case OutputType.Wall:
          break; // Cannot move
        case OutputType.Empty:
        case OutputType.OxygenSystem:
          position = newPosition;
          const possibleMovements = [
            Movement.North,
            Movement.South,
            Movement.West,
            Movement.East,
          ].filter((movement) => {
            const adjacentPosition = structuredClone(position);
            switch (movement) {
              case Movement.North:
                adjacentPosition.y--;
                break;
              case Movement.South:
                adjacentPosition.y++;
                break;
              case Movement.West:
                adjacentPosition.x--;
                break;
              case Movement.East:
                adjacentPosition.x++;
                break;
            }
            return !grid.has(xyToString(adjacentPosition));
          });
          stack.push(...possibleMovements);
          break;
      }
    }
  }

  start(): void {
    this.program.run();
  }

  async move(movement: Movement): Promise<OutputType> {
    const outputPromise = this.outputPromise.await();
    this.awaitNextInputPromise.resolve(movement);
    return await outputPromise;
  }

  get shortestPathToOxygenSystem(): number {
    return 0;
  }
}

const repairDroid = new RepairDroid();

repairDroid.explore();

const result = repairDroid.shortestPathToOxygenSystem;

console.log(result); //
