import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

enum Direction {
  Up = "U",
  Right = "R",
  Down = "D",
  Left = "L",
}

type Move = {
  direction: Direction;
  distance: number;
};

const allMoves: [Move[], Move[]] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) =>
    line.split(",").map((item) => {
      return {
        direction: item[0] as Direction,
        distance: parseInt(item.substring(1)),
      };
    }),
  ) as [Move[], Move[]];

type XY = {
  x: number;
  y: number;
};

type Path = XY[];

const paths: [Path, Path] = [[{ x: 0, y: 0 }], [{ x: 0, y: 0 }]];

for (let i = 0; i < 2; i++) {
  const moves = allMoves[i];
  const path = paths[i];
  for (const move of moves) {
    const previousPosition = path[path.length - 1];
    const newPosition = {
      x:
        previousPosition.x +
        (move.direction === Direction.Right
          ? move.distance
          : move.direction === Direction.Left
            ? -move.distance
            : 0),
      y:
        previousPosition.y +
        (move.direction === Direction.Down
          ? move.distance
          : move.direction === Direction.Up
            ? -move.distance
            : 0),
    };
    path.push(newPosition);
  }
}

const intersectingPoints: XY[] = [];

type Segment = {
  from: XY;
  to: XY;
};

const getIntersection = (segment1: Segment, segment2: Segment): XY | null => {
  const isSegment1Vertical = segment1.from.x === segment1.to.x;
  const isSegment2Vertical = segment2.from.x === segment2.to.x;
  if (isSegment1Vertical === isSegment2Vertical) {
    // The segments have the same direction.
    // We assume they don't intersect.
    return null;
  }

  const verticalSegment = isSegment1Vertical ? segment1 : segment2;
  const horizontalSegment = isSegment1Vertical ? segment2 : segment1;

  const x = verticalSegment.from.x;

  const minX = Math.min(horizontalSegment.from.x, horizontalSegment.to.x);
  const maxX = Math.max(horizontalSegment.from.x, horizontalSegment.to.x);
  if (!(minX <= x && x <= maxX)) {
    return null;
  }

  const y = horizontalSegment.from.y;

  const minY = Math.min(verticalSegment.from.y, verticalSegment.to.y);
  const maxY = Math.max(verticalSegment.from.y, verticalSegment.to.y);
  if (!(minY <= y && y <= maxY)) {
    return null;
  }
  return {
    x,
    y,
  };
};

for (let i = 0; i < paths[0].length - 1; i++) {
  const segment1 = { from: paths[0][i], to: paths[0][i + 1] };
  for (let j = 0; j < paths[1].length - 1; j++) {
    const segment2 = { from: paths[1][j], to: paths[1][j + 1] };
    const intersection = getIntersection(segment1, segment2);
    if (intersection) {
      intersectingPoints.push(intersection);
    }
  }
}

console.log(intersectingPoints);

const result = Math.min(
  ...intersectingPoints
    .filter(
      (intersectingPoints) => intersectingPoints.x && intersectingPoints.y,
    )
    .map(
      (intersectionPoint) =>
        Math.abs(intersectionPoint.x) + Math.abs(intersectionPoint.y),
    ),
);

// 459 < x
console.log(result); // 1084
