import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "^" | "." | "S";

const grid = textInput.split("\n").map((line) => line.split("") as Tile[]);

type Position = {
  x: number;
  y: number;
};

const positionToString = (pos: Position): string => `${pos.x},${pos.y}`;

const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

const setOrAddToMap = (
  map: Map<string, number>,
  key: string,
  value: number
): void => {
  const existingValue = map.get(key) ?? 0;
  map.set(key, existingValue + value);
};

let positions = new Map<string, number>();

positions.set(positionToString({ y: 1, x: grid[0].indexOf("S") }), 1);

for (let y = 2; y < grid.length; y++) {
  const newPositions = new Map<string, number>();
  for (const [posStr, timelineCount] of positions) {
    const pos = stringToPosition(posStr);
    if (grid[y][pos.x] === ".") {
      setOrAddToMap(
        newPositions,
        positionToString({ x: pos.x, y }),
        timelineCount
      );
    } else {
      if (pos.x - 1 >= 0) {
        setOrAddToMap(
          newPositions,
          positionToString({ x: pos.x - 1, y }),
          timelineCount
        );
      }
      if (pos.x + 1 < grid[0].length) {
        setOrAddToMap(
          newPositions,
          positionToString({ x: pos.x + 1, y }),
          timelineCount
        );
      }
    }
  }
  positions = newPositions;
}

const result = [...positions.values()].reduce((acc, curr) => acc + curr, 0);

// x != 381288562161
console.log(result); // 23607984027985
