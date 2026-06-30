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

type Packet = {
  destination: bigint;
  x: bigint;
  y: bigint;
};

type NewPacket = Partial<Packet> & {
  destination: bigint;
};

class Computer {
  constructor(
    private id: bigint,
    private onEmit: (packet: Packet) => void,
    private onRequestFailure: () => void,
  ) {}

  public static halt: boolean = false;
  private intCode: Map<bigint, bigint> = structuredClone(intCode);

  public queue: Packet[] = [];
  private consumedPacket: Packet | null = null;

  private hasGottenId: boolean = false;

  private emittedPacket: NewPacket | null = null;

  private program = new Program(
    this.intCode,
    async (output) => {
      this.idleCount = 0;
      if (!this.emittedPacket) {
        this.emittedPacket = {
          destination: output,
        };
      } else if (this.emittedPacket.x === undefined) {
        this.emittedPacket.x = output;
      } else {
        this.emittedPacket.y = output;

        this.onEmit(this.emittedPacket as Packet);

        this.emittedPacket = null;
      }
    },
    async () => {
      if (!this.hasGottenId) {
        this.hasGottenId = true;
        return this.id;
      }

      if (this.consumedPacket) {
        const value = this.consumedPacket.y;
        this.consumedPacket = null;
        return value;
      } else if (this.queue.length) {
        this.consumedPacket = this.queue.shift()!;
        this.idleCount = 0;
        return this.consumedPacket.x;
      }
      this.idleCount++;
      this.onRequestFailure();

      return -1n;
    },
    async () => Computer.halt,
  );

  async boot(): Promise<void> {
    await this.program.run();
  }

  private idleCount: number = 0;

  public get isIdle(): boolean {
    return !this.queue.length && this.idleCount > 2;
  }
}

const main = async (): Promise<void> => {
  const natSentPackets: Packet[] = [];
  const natReceivedPackets: Packet[] = [];
  let natPacket: Packet | null = null;
  let packetResult: Packet | null = null;

  const computers = Array.from(
    { length: 50 },
    (_, index) =>
      new Computer(
        BigInt(index),
        (value) => {
          if (value.destination === 255n) {
            natReceivedPackets.push(value);
            natPacket = value;
          } else {
            computers[Number(value.destination)].queue.push(value);
          }
        },
        () => {
          if (isNetworkIdle()) {
            if (natSentPackets.length) {
              const last = natSentPackets[natSentPackets.length - 1];
              if (last.y === natPacket!.y && !Computer.halt) {
                Computer.halt = true;
                packetResult = natPacket;
              }
            }
            if (natPacket) {
              natSentPackets.push(natPacket);
              computers[0].queue.push(natPacket!);
            }
          }
        },
      ),
  );

  const isNetworkIdle = (): boolean => {
    return computers.every((computer) => computer.isIdle);
  };

  const promises = computers.map((computer) => computer.boot());

  await Promise.all(promises);

  const result = packetResult!.y;

  // x < 20305 < 21160
  console.log(result); // 14327
};

main();
