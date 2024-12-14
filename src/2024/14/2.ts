import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type XY = { x: number; y: number };

type Robot = {
  position: XY;
  velocity: XY;
};

let robots: Robot[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [position, velocity] = line
      .split(" ")
      .filter(Boolean)
      .map((xyText) => {
        const [x, y] = xyText.split("=")[1].split(",").map(Number);
        return { x, y };
      });
    return { position, velocity };
  });

const size: XY = {
  x: example ? 11 : 101,
  y: example ? 7 : 103,
};

const addXY = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y });

const moduloXY = (a: XY, b: XY): XY => ({ x: a.x % b.x, y: a.y % b.y });

const getNewPosition = (robot: Robot): Robot => {
  return {
    position: moduloXY(
      addXY(moduloXY(addXY(robot.position, robot.velocity), size), size),
      size
    ),
    velocity: robot.velocity,
  };
};

const robotCount = robots.length;

const threshold = 0.1;

/**
 * A Christmas tree is vertically symmetrical.
 */
const couldBeChristmasTree = (): boolean => {
  // Check if the robots are vertically symmetrical.

  const hasSymmetricCount = robots.filter(
    (robot, _, robots) =>
      !!robots.find(
        (otherRobot) =>
          otherRobot.position.x === size.x - 1 - robot.position.x &&
          otherRobot.position.y === robot.position.y
      )
  ).length;

  return (robotCount - hasSymmetricCount) / robotCount < threshold;
};

const logMap = () => {
  const map = Array.from({ length: size.y }, () =>
    Array.from({ length: size.x }, () => 0)
  );
  for (let robot of robots) {
    map[robot.position.y][robot.position.x] += 1;
  }

  const string = map
    .map((row) => row.map((value) => (value ? value.toString() : ".")).join(""))
    .join("\n");
  console.log(string);
};

let i = 0;
while (true) {
  if (!(i % 1e4)) {
    console.log(i);
    logMap();
  }
  i++;
  robots = robots.map(getNewPosition);
  if (couldBeChristmasTree()) {
    console.log("could be christmas tree", i);
  }
}
