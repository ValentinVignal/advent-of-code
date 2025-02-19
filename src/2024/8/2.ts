import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const map = textInput.split("\n").map((line) => line.split(""));

type XY = {
  x: number;
  y: number;
};

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });
const multiplyXY = (a: XY, b: number): XY => ({ x: a.x * b, y: a.y * b });

const antennas = new Map<string, XY[]>();

for (let i = 0; i < map.length; i++) {
  for (let j = 0; j < map[i].length; j++) {
    const item = map[i][j];
    if (item === ".") continue;
    antennas.set(item, antennas.get(item) ?? []);
    antennas.get(item)!.push({ x: j, y: i });
  }
}

const xyToString = ({ x, y }: XY) => `${x},${y}`;

const antinodes = new Set<string>();

for (const positions of antennas.values()) {
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      const delta = addXY(b, multiplyXY(a, -1));
      for (let i = 0; true; i++) {
        const antinode = addXY(b, multiplyXY(delta, i));
        if (
          antinode.x < 0 ||
          antinode.y < 0 ||
          antinode.x >= map[0].length ||
          antinode.y >= map.length
        )
          break;
        antinodes.add(xyToString(antinode));
      }
      for (let i = 0; true; i--) {
        const antinode = addXY(a, multiplyXY(delta, i));
        if (
          antinode.x < 0 ||
          antinode.y < 0 ||
          antinode.x >= map[0].length ||
          antinode.y >= map.length
        )
          break;
        antinodes.add(xyToString(antinode));
      }
    }
  }
}

// x != 1059
console.log(antinodes.size); // 1174
