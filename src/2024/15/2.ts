import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, `input.txt`), "utf-8");

const [mapText, movesText] = textInput.split("\n\n");

type Tile = "." | "#" | "[" | "]" | "@";

const map: Tile[][] = mapText
  .split("\n")
  .filter(Boolean)
  .map(
    (line) =>
      line
        .split("")
        .filter(Boolean)
        .map((tile) => {
          switch (tile) {
            case ".":
              return [".", "."];
            case "#":
              return ["#", "#"];
            case "O":
              return ["[", "]"];
            case "@":
              return ["@", "."];
            default:
              throw new Error(`Unknown tile: ${tile}`);
          }
        })
        .flat() as Tile[]
  );

enum Move {
  Up = "^",
  Down = "v",
  Left = "<",
  Right = ">",
}

const moves = movesText
  .replaceAll("\n", "")
  .split("")
  .filter(Boolean) as Move[];

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

const boxChar = ["[", "]"];

const add = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const logMap = () => {
  console.log(map.map((line) => line.join("")).join("\n"));
};

const xyToString = (xy: XY): string => `${xy.x},${xy.y}`;

const xyFromString = (str: string): XY => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

const logEnabled = false;

for (const move of moves) {
  if (logEnabled) {
    logMap();
    console.log("move:", move);
  }
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
  // The next position is a box.

  // The easy case if horizontal.
  if (delta.x !== 0) {
    let nextNonBoxPosition = add(nextRobotPosition, delta);

    while (boxChar.includes(map[nextNonBoxPosition.y][nextNonBoxPosition.x])) {
      // Need to check if
      nextNonBoxPosition = add(nextNonBoxPosition, delta);
    }
    if (map[nextNonBoxPosition.y][nextNonBoxPosition.x] === "#") {
      // The boxes cannot be moved.
      continue;
    }
    // The boxes can be moved.
    const indexes = [
      Math.min(robot.x, nextNonBoxPosition.x + 1),
      Math.max(robot.x + 1, nextNonBoxPosition.x),
    ];
    const boxes = map[robot.y].slice(indexes[0], indexes[1]);
    map[robot.y].splice(indexes[0] + delta.x, boxes.length, ...boxes);
    map[robot.y][robot.x] = ".";
    robot = nextRobotPosition;
    continue;
  }
  // The robot moves vertically and there is a box in the way.
  let boxesToMove = [new Set<string>()];
  boxesToMove[0].add(xyToString(nextRobotPosition));
  boxesToMove[0].add(
    xyToString(
      add(nextRobotPosition, {
        x: map[nextRobotPosition.y][nextRobotPosition.x] === "[" ? 1 : -1,
        y: 0,
      })
    )
  );
  let canMove = true;
  while (canMove && boxesToMove[boxesToMove.length - 1].size) {
    boxesToMove.push(new Set<string>());
    for (const box of boxesToMove[boxesToMove.length - 2]) {
      const boxXY = xyFromString(box);
      const nextBoxXY = add(boxXY, delta);
      if (map[nextBoxXY.y][nextBoxXY.x] === "#") {
        canMove = false;
        break;
      }
      if (boxChar.includes(map[nextBoxXY.y][nextBoxXY.x])) {
        boxesToMove[boxesToMove.length - 1].add(xyToString(nextBoxXY));
        boxesToMove[boxesToMove.length - 1].add(
          xyToString(
            add(nextBoxXY, {
              x: map[nextBoxXY.y][nextBoxXY.x] === "[" ? 1 : -1,
              y: 0,
            })
          )
        );
      }
    }
  }
  if (!canMove) continue;

  // The big block needs to move.
  for (const boxes of boxesToMove.reverse()) {
    const boxesArray = Array.from(boxes).map((str) => xyFromString(str));
    for (const box of boxesArray) {
      const nextBox = add(box, delta);
      const char = map[box.y][box.x];
      map[nextBox.y][nextBox.x] = char;
      map[box.y][box.x] = ".";
    }
  }
  map[nextRobotPosition.y][nextRobotPosition.x] = "@";
  map[robot.y][robot.x] = ".";
  robot = nextRobotPosition;
}

logMap();

const getGPSScore = (): number => {
  let score = 0;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "[") {
        score += 100 * y + x;
      }
    }
  }
  return score;
};

const result = getGPSScore();

console.log(result); // 1463160
