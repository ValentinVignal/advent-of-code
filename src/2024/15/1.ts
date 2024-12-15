import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, `input.txt`), "utf-8");

const [mapText, movesText] = textInput.split("\n\n");

type Tile = "." | "#" | "O" | "@";

const map: Tile[][] = mapText
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

enum Move {
  Up = "^",
  Down = "v",
  Left = "<",
  Right = ">",
}

const moves = movesText.split("").filter(Boolean) as Move[];

type XY = {
  x: number;
  y: number;
};

let robot!: XY;

outer: for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[y].length; x++) {
    if (map[y][x] === "@") {
      robot = { x, y };
      break outer;
    }
  }
}

const add = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const logMap = () => {
  console.log(map.map((line) => line.join("")).join("\n"));
};

for (const move of moves) {
  const delta: XY = {
    x: move === Move.Left ? -1 : move === Move.Right ? 1 : 0,
    y: move === Move.Up ? -1 : move === Move.Down ? 1 : 0,
  };
  let nextRobotPosition = add(robot, delta);
  if (map[nextRobotPosition.y][nextRobotPosition.x] === "#") {
    continue;
  }
  if (map[nextRobotPosition.y][nextRobotPosition.x] === ".") {
    map[nextRobotPosition.y][nextRobotPosition.x] = "@";
    map[robot.y][robot.x] = ".";
    robot = nextRobotPosition;
    continue;
  }
  // The next position is a boxes O.

  let nextNonBoxPosition = add(nextRobotPosition, delta);
  while (map[nextNonBoxPosition.y][nextNonBoxPosition.x] === "O") {
    nextNonBoxPosition = add(nextNonBoxPosition, delta);
  }
  if (map[nextNonBoxPosition.y][nextNonBoxPosition.x] === "#") {
    // The boxes cannot be moved.
    continue;
  }
  // The boxes can be moved.
  map[nextNonBoxPosition.y][nextNonBoxPosition.x] = "O";
  map[nextRobotPosition.y][nextRobotPosition.x] = "@";
  map[robot.y][robot.x] = ".";
  robot = nextRobotPosition;
  continue;
}

logMap();

const getGPSScore = (): number => {
  let score = 0;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "O") {
        score += 100 * y + x;
      }
    }
  }
  return score;
};

const result = getGPSScore();

console.log(result); // 1421727
