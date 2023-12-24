import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type XY = { x: number; y: number };

type XYZ = XY & { z: number };

type Hail = {
  position: XYZ;
  velocity: XYZ;
};

const hails: Hail[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [position, velocity] = line.split(" @ ").map((part) => {
      const [x, y, z] = part.split(", ").map(Number);
      return { x, y, z };
    });

    return { position, velocity };
  });

const epsilon = 10 ** -6;

const almostEqual = (a: number, b: number) => Math.abs((a - b) / a) < epsilon;

type M = { y: number; z: number };

const getM = ({ x, y, z }: XYZ): M => {
  // There is no need to check for division by zero, as the input doesn't
  // contain any `0`.
  return { y: y / x, z: z / x };
};

let count = 0;
hails.forEach((hail, index) => {
  const m = getM(hail.velocity);

  hails.slice(index + 1).forEach((otherHail, otherIndexOffset) => {
    const otherIndex = index + 1 + otherIndexOffset;
    const otherM = getM(otherHail.velocity);
    const isY = almostEqual(m.y, otherM.y);
    const isZ = almostEqual(m.z, otherM.z);
    if (isY || isZ) {
      count++;
      console.log(index, otherIndex, isY, isZ);
    }
  });
});

console.log(count);
