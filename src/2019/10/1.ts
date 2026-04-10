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

for (const a of positions) {
  const angles = new Set<number>();
  for (const b of positions) {
    const vector = { x: b.x - a.x, y: b.y - a.y };

    if (!vector.x && !vector.y) continue;

    const angle = Math.atan2(vector.y, vector.x);
    angles.add(angle);
  }

  if (sighCountMax < angles.size) {
    sighCountMax = angles.size;
  }
}

// 301 < x
console.log(sighCountMax); // 319
