import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type XY = {
  x: number;
  y: number;
};

type Machine = {
  a: XY;
  b: XY;
  x: XY;
};

const machines: Machine[] = textInput
  .split("\n\n")
  .filter(Boolean)
  .map((block) => {
    const lines = block.split("\n").filter(Boolean);
    const [a, b] = lines.slice(0, 2).map((line) => {
      return line
        .split(": ")[1]
        .split(",")
        .map((item) => parseInt(item.split("+")[1]));
    });
    const x = lines[2]
      .split(": ")[1]
      .split(",")
      .map((item) => parseInt(item.split("=")[1]));
    return {
      a: { x: a[0], y: a[1] },
      b: { x: b[0], y: b[1] },
      x: { x: x[0] + 10000000000000, y: x[1] + 10000000000000 },
    };
  });

type AB = {
  a: number;
  b: number;
};

const getButtonPushes = ({ a, b, x }: Machine): AB => {
  const bPushes = (x.y - (x.x * a.y) / a.x) / (b.y - (a.y * b.x) / a.x);
  const aPushes = x.x / a.x - (b.x / a.x) * bPushes;
  return {
    a: aPushes,
    b: bPushes,
  };
};

const epsilon = 1e-6;

let result = 0;

for (const machine of machines) {
  const { a, b } = getButtonPushes(machine);

  if (
    Math.abs(a - Math.round(a)) > epsilon ||
    Math.abs(b - Math.round(b)) > epsilon
  )
    continue;
  if (a + epsilon < 0 || b + epsilon < 0) continue;
  if (a - epsilon > 100 || b - epsilon > 100) continue;

  result += 3 * Math.round(a) + Math.round(b);
}

console.log(result); // 31552
