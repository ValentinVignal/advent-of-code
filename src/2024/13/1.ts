import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(
  path.join(__dirname, "input-example.txt"),
  "utf-8"
);

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
      x: { x: x[0], y: x[1] },
    };
  });

enum Button {
  A = "a",
  B = "b",
}

type AB = {
  a: number;
  b: number;
};

const getButtonPushes = (machine: Machine): AB => {
  type HV = { h: number; v: number };

  // Express canonical vectors from a and b.

  const mostHorizontal =
    Math.abs(machine.a.x / machine.a.y) > Math.abs(machine.b.x / machine.b.y)
      ? Button.A
      : Button.B;

  const mostVertical = mostHorizontal === Button.A ? Button.B : Button.A;

  const h = machine[mostHorizontal];
  const v = machine[mostVertical];

  const xDenominator = h.x - (h.y * v.x) / v.y;
  let vectorX: HV = {
    h: 1 / xDenominator,
    v: h.y / (v.y * xDenominator),
  };

  const yDenominator = v.y - (v.x * h.y) / h.x;
  let vectorY: HV = {
    h: v.x / (h.x * yDenominator),
    v: 1 / yDenominator,
  };

  const hCount = machine.x.x * vectorX.h + machine.x.y * vectorY.h;
  const vCount = machine.x.x * vectorX.v + machine.x.y * vectorY.v;

  return {
    [mostHorizontal]: hCount,
    [mostVertical]: vCount,
  } as AB;
};

for (const machine of machines) {
  const { a, b } = getButtonPushes(machine);

  console.log(a, b);
}
