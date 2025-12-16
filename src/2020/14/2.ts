import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-2" : ""}.txt`),
  "utf-8"
);

type Mask = {
  instruction: "mask";
  mask: string;
};

type Memory = {
  instruction: "mem";
  index: number;
  value: number;
};

type Instruction = Mask | Memory;

const instructions: Instruction[] = textInput.split("\n").map((line) => {
  const [instructionString, valueString] = line.split(" = ");
  if (instructionString === "mask") {
    return {
      instruction: "mask",
      mask: valueString,
    };
  } else {
    const index = parseInt(instructionString.split("[")[1].split("]")[0]);
    return {
      instruction: "mem",
      index,
      value: parseInt(valueString),
    };
  }
});

let memory = new Map<bigint, bigint>();
let mask = "";

for (const instruction of instructions) {
  if (instruction.instruction === "mask") {
    mask = instruction.mask;
  } else {
    const addresses: bigint[] = [];
    let baseAddress = BigInt(instruction.index);
    const floatingBits: number[] = [];
    for (let i = 0; i < mask.length; i++) {
      const bit = mask[mask.length - 1 - i];
      if (bit === "1") {
        baseAddress |= 1n << BigInt(i);
      } else if (bit === "X") {
        floatingBits.push(i);
      }
    }
    const combinations = 1 << floatingBits.length;
    for (let combo = 0; combo < combinations; combo++) {
      let address = BigInt(baseAddress);
      for (let bitIndex = 0; bitIndex < floatingBits.length; bitIndex++) {
        const bitPosition = BigInt(floatingBits[bitIndex]);
        if ((combo & (1 << bitIndex)) !== 0) {
          address |= 1n << bitPosition;
        } else {
          address &= ~(1n << bitPosition);
        }
      }
      addresses.push(address);
    }
    for (const addr of addresses) {
      memory.set(addr, BigInt(instruction.value));
    }
  }
}

const result = Array.from(memory.values()).reduce((acc, val) => acc + val, 0n);

console.log(memory);

// 3000389407259 < x
console.log(result); // 3435342392262
