import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Move = "e" | "se" | "sw" | "w" | "nw" | "ne";

const moves: Move[][] = textInput.split("\n").map((line) => {
  const moves: Move[] = [];
  for (let i = 0; i < line.length; i++) {
    let move = line[i];
    if (move === "s" || move === "n") {
      move += line[i + 1];
      i++;
    }
    moves.push(move as Move);
  }
  return moves;
});

type XY = {
  x: number;
  y: number;
};

const xyToString = ({ x, y }: XY): string => {
  return `${x},${y}`;
};

const flipped = new Set<string>();

for (const line of moves) {
  let x = 0;
  let y = 0;
  for (const move of line) {
    switch (move) {
      case "e":
        x += 2;
        break;
      case "w":
        x -= 2;
        break;
      case "se":
        y--;
        x++;
        break;
      case "sw":
        y--;
        x--;
        break;
      case "ne":
        y++;
        x++;
        break;
      case "nw":
        y++;
        x--;
        break;
    }
  }
  const key = xyToString({ x, y });
  if (flipped.has(key)) {
    flipped.delete(key);
  } else {
    flipped.add(key);
  }
}

const result = flipped.size;

console.log(result); // 382
