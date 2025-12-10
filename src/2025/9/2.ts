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
  /** Checks whether the horizontal edge between two positions is fully inside the shape */
  const checkRectangleEdge = (from: Position, to: Position): boolean => {
    const direction =
      from.x === to.x ? Alignment.Vertical : Alignment.Horizontal;

    /** Returns the main axis value of a position based on the direction */
    const getMainAxis = (pos: Position): number =>
      direction === Alignment.Horizontal ? pos.x : pos.y;

    /** Returns the cross axis value of a position based on the direction */
    const getCrossAxis = (pos: Position): number =>
      direction === Alignment.Horizontal ? pos.y : pos.x;
    let previousSign: Sign | null = null;
    let isInside = false;
    const intersectingCrossEdges = (
      direction === Alignment.Horizontal ? verticalEdges : horizontalEdges
    )
      .filter((edge) => {
        const minCross = Math.min(
          getCrossAxis(edge.from),
          getCrossAxis(edge.to)
        );
        const maxCross = Math.max(
          getCrossAxis(edge.from),
          getCrossAxis(edge.to)
        );
        return (
          // We don't want to test `getMainAxis(edge.from) >= getMainAxis(from)`
          // because we need to consider all the edges from the index 0.
          getMainAxis(edge.from) <= getMainAxis(to) &&
          minCross <= getCrossAxis(from) &&
          maxCross >= getCrossAxis(from)
        );
      })
      .sort((a, b) => getMainAxis(a.from) - getMainAxis(b.from));
    const indexes = [
      ...intersectingCrossEdges.map((edge) => getMainAxis(edge.from)),
      getMainAxis(from),
      getMainAxis(from) + 1,
      getMainAxis(to) - 1,
      getMainAxis(to),
    ]
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort((a, b) => a - b);
    let currentIndex = -1;
    while (
      indexes[currentIndex + 1] <= getMainAxis(to) &&
      currentIndex + 1 < indexes.length
    ) {
      currentIndex++;
      const x = indexes[currentIndex];
      const crossEdge = intersectingCrossEdges.find((edge) => {
        if (getMainAxis(edge.from) !== x) return false;

        const minYEdge = Math.min(
          getCrossAxis(edge.from),
          getCrossAxis(edge.to)
        );
        const maxYEdge = Math.max(
          getCrossAxis(edge.from),
          getCrossAxis(edge.to)
        );
        return minYEdge <= from.y && maxYEdge >= from.y;
      });
      const isOnCrossEdge = !!crossEdge;

      const parallelEdge = (
        direction === Alignment.Horizontal ? horizontalEdges : verticalEdges
      ).find((edge) => {
        const minXEdge = Math.min(getMainAxis(edge.from), getMainAxis(edge.to));
        const maxXEdge = Math.max(getMainAxis(edge.from), getMainAxis(edge.to));
        return (
          getCrossAxis(edge.from) === getCrossAxis(from) &&
          minXEdge <= x &&
          maxXEdge >= x
        );
      });
      const isOnParallelEdge = !!parallelEdge;

      const isInsideCheckRectangleEdge = from.x <= x && x <= to.x;

      if (
        !isInside &&
        !isOnCrossEdge &&
        !isOnParallelEdge &&
        isInsideCheckRectangleEdge
      ) {
        return false;
      }
      if (!isOnCrossEdge) {
        continue;
      }

      const isOnCorner =
        x === getMainAxis(crossEdge.from) &&
        (getCrossAxis(crossEdge.from) === getCrossAxis(from) ||
          getCrossAxis(crossEdge.to) === getCrossAxis(from));

      if (!isOnCorner) {
        isInside = !isInside;
        continue;
      }

      if (
        Math.min(
          getMainAxis(parallelEdge!.from),
          getMainAxis(parallelEdge!.to)
        ) === x
      ) {
        // We are entering the horizontal edge.
        previousSign = parallelEdge!.sign;
      } else {
        // We are exiting the horizontal edge.

        if (previousSign === parallelEdge!.sign) {
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
    checkRectangleEdge(corners.topLeft, corners.topRight) &&
    checkRectangleEdge(corners.bottomLeft, corners.bottomRight) &&
    checkRectangleEdge(corners.topLeft, corners.bottomLeft) &&
    checkRectangleEdge(corners.topRight, corners.bottomRight)
  );
};

let maxArea = 0;
let positions: { a: Position; b: Position };

for (let i = 0; i < input.length; i++) {
  for (let j = i + 1; j < input.length; j++) {
    const posA = input[i];
    const posB = input[j];

    if (posA.x === 4 && posA.y === 16 && posB.x === 20 && posB.y === 2) {
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
