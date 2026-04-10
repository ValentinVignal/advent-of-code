import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "#";

const space = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

type XY = {
  x: number;
  y: number;
};

const subtractXY = (a: XY, b: XY): XY => {
  return { x: a.x - b.x, y: a.y - b.y };
};

const positions: XY[] = [];

for (let y = 0; y < space.length; y++) {
  for (let x = 0; x < space[0].length; x++) {
    const tile = space[y][x];
    if (tile === "#") {
      positions.push({ x, y });
    }
  }
}

let sighCountMax = 0;
let position: XY; // { x: 31, y: 20 }

for (const a of positions) {
  const angles = new Set<number>();
  for (const b of positions) {
    const vector = subtractXY(b, a);

    if (!vector.x && !vector.y) continue;

    const angle = Math.atan2(vector.y, vector.x);
    angles.add(angle);
  }

  if (sighCountMax < angles.size) {
    sighCountMax = angles.size;
    position = a;
  }
}

const angles = new Map<number, XY[]>();

// Aggregate all the angles.

for (const other of positions) {
  const vector = subtractXY(other, position!);
  if (!vector.x && !vector.y) continue;

  const angleRadians = Math.atan2(vector.y, vector.x);

  const normalizedAngle = (angleRadians + (5 * Math.PI) / 2) % (2 * Math.PI);

  if (!angles.has(normalizedAngle)) {
    angles.set(normalizedAngle, []);
  }

  angles.get(normalizedAngle)!.push(other);
}

// Sort the array by distance.

const norm2 = (x: XY): number => {
  return Math.sqrt(x.x ** 2 + x.y ** 2);
};

for (const [_, positions] of angles) {
  positions.sort((a, b) => {
    const vectorA = subtractXY(a, position);
    const vectorB = subtractXY(b, position);

    const normA = norm2(vectorA);
    const normB = norm2(vectorB);

    return normA - normB;
  });
}

let count = 0;
let last: XY;

const possibleAngles = [...angles.keys()].sort((a, b) => a - b);

let angleIndex = 0;

while (count < 200) {
  const angle = possibleAngles[angleIndex];
  const positions = angles.get(angle)!;

  if (!positions.length) {
    angleIndex++;
    angleIndex %= possibleAngles.length;
    continue;
  }

  const position = positions.shift()!;

  count++;
  last = position;
  angleIndex++;
  angleIndex %= possibleAngles.length;
}

const result = 100 * last!.x + last!.y;

// x < 919
console.log(result); // 517
