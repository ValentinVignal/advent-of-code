import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type XY = {
  x: number;
  y: number;
};

type Square = "." | "#";

type SquareMap = Square[][];

const map: SquareMap = textInput
  .split("\n")
  .map((line) => line.split("") as Square[]);

const visited = new Set<string>();

const xyToString = (xy: XY): string => `${xy.x},${xy.y}`;

let position: XY = { x: 0, y: 0 };

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

let direction = Direction.Up;

outer: for (let i = 0; i < map.length; i++) {
  for (let j = 0; j < map[i].length; j++) {
    // @ts-ignore
    if (map[i][j] === "^") {
      position = { x: j, y: i };
      map[i][j] = ".";
      break outer;
    }
  }
}

visited.add(xyToString(position));

while (true) {
  let nextPosition: XY = { x: position.x, y: position.y };
  switch (direction) {
    case Direction.Up:
      nextPosition.y--;
      break;
    case Direction.Right:
      nextPosition.x++;
      break;
    case Direction.Down:
      nextPosition.y++;
      break;
    case Direction.Left:
      nextPosition.x--;
      break;
  }

  if (
    0 <= nextPosition.x &&
    nextPosition.x < map[0].length &&
    0 <= nextPosition.y &&
    nextPosition.y < map.length
  ) {
    if (map[nextPosition.y][nextPosition.x] === "#") {
      direction = (direction + 1) % 4;
    } else {
      position = nextPosition;
      visited.add(xyToString(nextPosition));
    }
  } else {
    break;
  }
}

console.log(visited.size); // 4559
