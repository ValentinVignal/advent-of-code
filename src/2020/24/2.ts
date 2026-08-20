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

const xyFromString = (key: string) => {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
};

let flipped = new Set<string>();

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

const addXY = (a: XY, b: XY): XY => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
};

const getNeighbors = (xy: XY): XY[] => {
  const deltas: XY[] = [
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ];
  return deltas.map((delta) => addXY(xy, delta));
};

/**
 *
 * @param flipped: The list of black tiles to process.
 */
const flip = (flipped: Set<string>): Set<string> => {
  /**
   * The new black tiles at the end of the flip.
   */
  const newFlipped = new Set<string>();

  /**
   * The white tile to process that were neighbors of black tiles and might be
   * flipped.
   */
  const whiteToProcess = new Set<string>();

  const countAdjacentBlacks = (xy: XY): number => {
    const neighbors = getNeighbors(xy);

    return neighbors.filter((xy) => {
      const key = xyToString(xy);
      return flipped.has(key);
    }).length;
  };

  // Process the black tiles first.
  //
  // Aggregate the white tiles to process at the same time.
  for (const blackTile of flipped) {
    const xy = xyFromString(blackTile);
    const adjacentBlacks = countAdjacentBlacks(xy);
    if (adjacentBlacks === 1 || adjacentBlacks === 2) {
      // Ambiguous: add === 2 as well ?
      newFlipped.add(blackTile);
    }
    const neighbors = getNeighbors(xy);
    for (const neighbor of neighbors) {
      const key = xyToString(neighbor);
      if (flipped.has(key)) {
        // The tile is black, ignore it.
        continue;
      }
      whiteToProcess.add(key);
    }
  }

  // Process the white tiles.
  for (const whiteTile of whiteToProcess) {
    const xy = xyFromString(whiteTile);
    const adjacentBlacks = countAdjacentBlacks(xy);
    if (adjacentBlacks === 2) {
      newFlipped.add(whiteTile);
    }
  }

  return newFlipped;
};

for (let i = 0; i < 100; i++) {
  flipped = flip(flipped);
}

const result = flipped.size;

// 1589 < x
console.log(result); // 3964
