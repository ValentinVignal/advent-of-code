import { readFileSync } from "fs";
import * as path from "path";

const example = 2;
const textInput = readFileSync(
  path.join(
    __dirname,
    `input${
      example ? (example > 1 ? `-example-${example}` : "-example") : ""
    }.txt`
  ),
  "utf-8"
);

type Position = {
  x: number;
  y: number;
};

const input = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [x, y] = line.split(",").map(Number);
    return { x, y } as Position;
  });

console.log(input);

enum Alignment {
  Horizontal,
  Vertical,
}

type Sign = 1 | -1;

type Edge = {
  from: Position;
  to: Position;
  alignment: Alignment;
  sign: Sign;
};

const edges: Edge[] = input.map((from, index) => {
  let to = input[index === input.length - 1 ? 0 : index + 1];
  const alignment = from.x === to.x ? Alignment.Vertical : Alignment.Horizontal;
  const sign =
    alignment === Alignment.Horizontal
      ? from.x < to.x
        ? 1
        : -1
      : from.y < to.y
        ? 1
        : -1;

  return { from, to, alignment, sign };
});

const verticalEdges = edges.filter(
  (edge) => edge.alignment === Alignment.Vertical
);
const horizontalEdges = edges.filter(
  (edge) => edge.alignment === Alignment.Horizontal
);

enum PositionLocation {
  Corner,
  Inside,
  Outside,
}

const isInsideEdge = (position: Position): PositionLocation => {
  let result = PositionLocation.Outside;
  for (const edge of edges) {
    if (
      (edge.to.x === position.x && edge.to.y === position.y) ||
      (edge.from.x === position.x && edge.from.y === position.y)
    ) {
      return PositionLocation.Corner;
    } else if (edge.alignment === Alignment.Horizontal) {
      if (
        position.y === edge.from.y &&
        position.x >= Math.min(edge.from.x, edge.to.x) &&
        position.x <= Math.max(edge.from.x, edge.to.x)
      ) {
        result = PositionLocation.Inside;
      }
    } else if (edge.alignment === Alignment.Vertical) {
      if (
        position.x === edge.from.x &&
        position.y >= Math.min(edge.from.y, edge.to.y) &&
        position.y <= Math.max(edge.from.y, edge.to.y)
      ) {
        result = PositionLocation.Inside;
      }
    }
  }
  return result;
};

/** Log the grid into a text file */
const logGridInFile = (foundPositions?: [Position, Position]): void => {
  const minX = Math.min(...input.map((pos) => pos.x));
  const maxX = Math.max(...input.map((pos) => pos.x));
  const minY = Math.min(...input.map((pos) => pos.y));
  const maxY = Math.max(...input.map((pos) => pos.y));

  console.log({ minX, maxX, minY, maxY });

  let output = "";
  for (let line = minY; line <= maxY; line++) {
    for (let column = minX; column <= maxX; column++) {
      const position = { x: column, y: line };
      if (
        foundPositions &&
        ((position.x === foundPositions[0].x &&
          position.y === foundPositions[0].y) ||
          (position.x === foundPositions[1].x &&
            position.y === foundPositions[1].y))
      ) {
        output += "\x1b[1m\x1b[33mO\x1b[0m";
        continue;
      }
      const location = isInsideEdge(position);
      if (location === PositionLocation.Corner) {
        output += "\x1b[1m\x1b[35m#\x1b[0m";
      } else if (location === PositionLocation.Inside) {
        output += "X";
      } else {
        output += ".";
      }
    }
    output += "\n";
  }

  console.log(output);
};

logGridInFile();

const isAllGreen = (a: Position, b: Position): boolean => {
  const checkHorizontalEdge = (from: Position, to: Position): boolean => {
    let previousSign: Sign | null = null;
    let isInside = false;
    const intersectingVerticalEdges = verticalEdges
      .filter((edge) => {
        const minYEdge = Math.min(edge.from.y, edge.to.y);
        const maxYEdge = Math.max(edge.from.y, edge.to.y);
        return (
          edge.from.x >= from.x &&
          edge.from.x <= to.x &&
          minYEdge <= from.y &&
          maxYEdge >= from.y
        );
      })
      .sort((a, b) => a.from.x - b.from.x);
    const indexes = [
      ...intersectingVerticalEdges.map((edge) => edge.from.x),
      from.x,
      from.x + 1,
      to.x - 1,
      to.x,
    ]
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort((a, b) => a - b);
    let currentIndex = -1;
    while (
      indexes[currentIndex + 1] <= to.x &&
      currentIndex + 1 < indexes.length
    ) {
      currentIndex++;
      const x = indexes[currentIndex];
      const verticalEdge = intersectingVerticalEdges.find((edge) => {
        if (edge.from.x !== x) return false;

        const minYEdge = Math.min(edge.from.y, edge.to.y);
        const maxYEdge = Math.max(edge.from.y, edge.to.y);
        return minYEdge <= from.y && maxYEdge >= from.y;
      });
      const isOnVerticalEdge = !!verticalEdge;

      const horizontalEdge = horizontalEdges.find((edge) => {
        const minXEdge = Math.min(edge.from.x, edge.to.x);
        const maxXEdge = Math.max(edge.from.x, edge.to.x);
        return edge.from.y === from.y && minXEdge <= x && maxXEdge >= x;
      });
      const isOnHorizontalEdge = !!horizontalEdge;

      const isInsideVerifiedEdge = from.x <= x && x <= to.x;

      if (
        !isInside &&
        !isOnVerticalEdge &&
        !isOnHorizontalEdge &&
        isInsideVerifiedEdge
      ) {
        return false;
      }
      if (!isOnVerticalEdge) {
        continue;
      }

      const isOnCorner =
        x === verticalEdge.from.x &&
        (verticalEdge.from.y === from.y || verticalEdge.to.y === from.y);

      if (!isOnCorner) {
        isInside = !isInside;
        continue;
      }

      if (Math.min(horizontalEdge!.from.x, horizontalEdge!.to.x) === x) {
        // We are entering the horizontal edge.
        previousSign = horizontalEdge!.sign;
      } else {
        // We are exiting the horizontal edge.

        if (previousSign === horizontalEdge!.sign) {
          isInside = !isInside;
        } else {
          // Do nothing.
        }
        previousSign = null;
      }
    }
    return true;
  };

  const checkVerticalEdge = (from: Position, to: Position): boolean => {
    let previousSign: Sign | null = null;
    let isInside = false;
    const intersectingHorizontalEdges = horizontalEdges
      .filter((edge) => {
        const minXEdge = Math.min(edge.from.x, edge.to.x);
        const maxXEdge = Math.max(edge.from.x, edge.to.x);
        return (
          edge.from.y >= from.y &&
          edge.from.y <= to.y &&
          minXEdge <= from.x &&
          maxXEdge >= from.x
        );
      })
      .sort((a, b) => a.from.y - b.from.y);
    const indexes = [
      ...intersectingHorizontalEdges.map((edge) => edge.from.y),
      from.y,
      from.y + 1,
      to.y - 1,
      to.y,
    ].sort((a, b) => a - b);
    let currentIndex = -1;
    while (
      currentIndex < indexes.length - 1 &&
      indexes[currentIndex + 1] <= to.y
    ) {
      currentIndex++;
      const y = indexes[currentIndex];
      const horizontalEdge = intersectingHorizontalEdges.find((edge) => {
        const minXEdge = Math.min(edge.from.x, edge.to.x);
        const maxXEdge = Math.max(edge.from.x, edge.to.x);
        return minXEdge <= from.x && maxXEdge >= from.x;
      });
      const isOnHorizontalEdge = !!horizontalEdge;

      const verticalEdge = verticalEdges.find((edge) => {
        const minYEdge = Math.min(edge.from.y, edge.to.y);
        const maxYEdge = Math.max(edge.from.y, edge.to.y);
        return edge.from.x === from.x && minYEdge <= y && maxYEdge >= y;
      });
      const isOnVerticalEdge = !!verticalEdge;

      const isInsideVerifiedEdge = from.y <= y && y <= to.y;

      if (
        !isInside &&
        !isOnHorizontalEdge &&
        !isOnVerticalEdge &&
        isInsideVerifiedEdge
      ) {
        return false;
      }
      if (!isOnHorizontalEdge) {
        continue;
      }

      const isOnCorner =
        y === horizontalEdge.from.y &&
        (horizontalEdge?.from.x === from.x || horizontalEdge?.to.x === from.x);

      if (!isOnCorner) {
        isInside = !isInside;
        continue;
      }

      if (Math.min(verticalEdge!.from.y, verticalEdge!.to.y) === y) {
        // We are entering the vertical edge.
        previousSign = verticalEdge!.sign;
      } else {
        // We are exiting the vertical edge.
        if (previousSign === horizontalEdge!.sign) {
          isInside = !isInside;
        } else {
          // Do nothing.
        }
        previousSign = null;
      }
    }
    return true;
  };

  const corners = {
    topLeft: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
    topRight: { x: Math.max(a.x, b.x), y: Math.min(a.y, b.y) },
    bottomLeft: { x: Math.min(a.x, b.x), y: Math.max(a.y, b.y) },
    bottomRight: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) },
  };

  return (
    checkHorizontalEdge(corners.topLeft, corners.topRight) &&
    checkHorizontalEdge(corners.bottomLeft, corners.bottomRight) &&
    checkVerticalEdge(corners.topLeft, corners.bottomLeft) &&
    checkVerticalEdge(corners.topRight, corners.bottomRight)
  );
};

let maxArea = 0;
let positions: { a: Position; b: Position };

for (let i = 0; i < input.length; i++) {
  for (let j = i + 1; j < input.length; j++) {
    const posA = input[i];
    const posB = input[j];

    if (posA.x === 9 && posA.y === 5 && posB.x === 2 && posB.y === 3) {
      console.log("debug");
    }

    if (!isAllGreen(posA, posB)) {
      continue;
    }

    const area = Math.abs(posA.x - posB.x + 1) * Math.abs(posA.y - posB.y + 1);
    if (area > maxArea) {
      maxArea = area;
      positions = { a: posA, b: posB };
    }
  }
}

logGridInFile([positions!.a, positions!.b]);

console.log(positions!);
// x < 2791469338 < 2916646439 < 2945126325
console.log("result:", maxArea); //
