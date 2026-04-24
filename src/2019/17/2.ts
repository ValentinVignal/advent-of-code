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

// const xyToString = ({ x, y }: XY): string => {
//   return `${x},${y}`;
// };

type Tile = "." | "#";

type Movement = "L" | "R" | number;

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

// https://imgur.com/a/5F7BSJj
const groupInstructions = (instructions: Movement[]): (string | number)[][] => {
  // This is a hard problem, and I don't have a good solution for it. I'm going to use a brute force approach, and try all possible combinations of functions and main routine. This is not efficient, but it works for the input I have.
  const instructionsString = instructions.join(",");
  console.log("instructions string", instructionsString);
  for (let aLength = 1; aLength <= 20; aLength++) {
    for (let bLength = 1; bLength <= 20; bLength++) {
      for (let cLength = 1; cLength <= 20; cLength++) {
        let remaining = instructionsString;
        const a = instructionsString.slice(0, aLength);
        remaining = remaining.replace(new RegExp(a + ",?", "gu"), "");
        const b = remaining.slice(0, bLength);
        remaining = remaining.replace(new RegExp(b + ",?", "gu"), "");
        const c = remaining.slice(0, cLength);
        remaining = remaining.replace(new RegExp(c + ",?", "gu"), "");
        if (!remaining) {
          let compressed = instructionsString;
          for (const [name, value] of [
            ["A", a],
            ["B", b],
            ["C", c],
          ]) {
            compressed = compressed.replaceAll(new RegExp(value, "gu"), name);
          }
          const result = [
            compressed.split(","),
            a.split(",").map((x) => (isNaN(Number(x)) ? x : Number(x))),
            b.split(",").map((x) => (isNaN(Number(x)) ? x : Number(x))),
            c.split(",").map((x) => (isNaN(Number(x)) ? x : Number(x))),
          ];
          console.log("result of compression", result);
          return result;
        }
      }
    }
  }

  throw Error("No solution found");
};

const main = async (): Promise<void> => {
  let outputText = "";

  const program = new Program(
    structuredClone(intCode),
    async (output) => {
      outputText += String.fromCharCode(Number(output));
    },
    () => {
      throw Error("No input expected");
    },
  );
  await program.run();

  console.log(outputText);

  const grid: Tile[][] = outputText
    .split("\n")
    .map((line) => line.split("") as Tile[]);

  let start: XY;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === ("^" as Tile)) {
        start = { x, y };
      }
    }
  }

  let position = start!;

  let instructions: Movement[] = ["L"];

  let direction: Direction = Direction.Left;

  const advance = (): void => {
    let distance = 0;
    while (true) {
      const nextPosition = (() => {
        switch (direction) {
          case Direction.Up:
            return { x: position.x, y: position.y - 1 };
          case Direction.Right:
            return { x: position.x + 1, y: position.y };
          case Direction.Down:
            return { x: position.x, y: position.y + 1 };
          case Direction.Left:
            return { x: position.x - 1, y: position.y };
        }
      })();
      if (
        0 <= nextPosition.y &&
        nextPosition.y < grid.length &&
        0 <= nextPosition.x &&
        nextPosition.x < grid[nextPosition.y].length &&
        grid[nextPosition.y][nextPosition.x] === "#"
      ) {
        position = nextPosition;
        distance++;
      } else {
        break;
      }
    }
    instructions.push(distance);
  };

  const rotate = (): boolean => {
    const leftDirection = ((direction + 3) % 4) as Direction;
    const rightDirection = ((direction + 1) % 4) as Direction;

    const canGoLeft = (() => {
      switch (leftDirection) {
        case Direction.Up:
          return 1 < position.y && grid[position.y - 1][position.x] === "#";
        case Direction.Right:
          return grid[position.y][position.x + 1] === "#";
        case Direction.Down:
          return (
            position.y + 1 < grid.length &&
            grid[position.y + 1][position.x] === "#"
          );
        case Direction.Left:
          return grid[position.y][position.x - 1] === "#";
      }
    })();

    const canGoRight = (() => {
      switch (rightDirection) {
        case Direction.Up:
          return 1 < position.y && grid[position.y - 1][position.x] === "#";
        case Direction.Right:
          return grid[position.y][position.x + 1] === "#";
        case Direction.Down:
          return (
            position.y + 1 < grid.length &&
            grid[position.y + 1][position.x] === "#"
          );
        case Direction.Left:
          return grid[position.y][position.x - 1] === "#";
      }
    })();

    if (canGoLeft) {
      direction = leftDirection;
      instructions.push("L");
      return true;
    } else if (canGoRight) {
      direction = rightDirection;
      instructions.push("R");
      return true;
    } else {
      return false;
    }
  };

  while (true) {
    advance();
    if (!rotate()) {
      break;
    }
  }

  console.log("instructions:", instructions.join(","));
  console.log("instructions length:", instructions.length);

  const routines = groupInstructions(instructions);

  console.log("routines", routines);

  let allInstructionsTemp = routines.map((row) =>
    row.flatMap((element, index, array) => [
      element,
      index === array.length - 1 ? "\n" : ",",
    ]),
  );

  console.log(allInstructionsTemp);
  let allInstructions = allInstructionsTemp.flatMap((row) => {
    return row.flatMap((element) => {
      if (typeof element === "string") {
        return BigInt(element.charCodeAt(0));
      } else if (typeof element === "number") {
        return element
          .toString()
          .split("")
          .map((x) => BigInt(x.charCodeAt(0)));
      }
      throw Error("Unexpected element type " + typeof element);
    });
  });

  console.log("instructions", allInstructions);

  const intCode2 = structuredClone(intCode);
  intCode2.set(0n, 2n);

  const videoFeed: "n" | "y" = "n";

  let inputIndex = 0;

  let allLogs = "";

  let result: bigint;

  const program2 = new Program(
    intCode2,
    async (output) => {
      const char = String.fromCharCode(Number(output));
      console.log("Output", output, char);

      allLogs += char;
      result = output;
    },
    () => {
      if (inputIndex < allInstructions.length) {
        console.log(
          "inputIndex",
          inputIndex,
          "input",
          allInstructions[inputIndex],
        );
        return Promise.resolve(allInstructions[inputIndex++]);
      } else {
        if (inputIndex === allInstructions.length) {
          console.log("video feed", videoFeed);
          const videoFeedValue = BigInt(videoFeed.charCodeAt(0));
          inputIndex++;
          return Promise.resolve(videoFeedValue);
        } else {
          return Promise.resolve(10n);
        }
      }
    },
  );

  await program2.run();

  console.log("All logs");
  console.log(allLogs);

  console.log("result", result!); // 1499679
};

main();
