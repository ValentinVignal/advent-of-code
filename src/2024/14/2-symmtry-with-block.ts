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

const xyToString = (xy: XY): string => `${xy.x},${xy.y}`;

/**
 * A Christmas tree is vertically symmetrical.
 */
const couldBeChristmasTree = (): boolean => {
  const quadrants = Array.from({ length: 10 }).map(() =>
    Array.from({ length: 10 }).map(() => new Set<string>())
  );

  for (let { position } of robots) {
    // get the y.

    let y = Math.floor(position.y / 10);
    y = Math.min(y, 9);
    let x = position.x;
    if (x === (size.x - 1) / 2) continue;
    if (x > (size.x - 1) / 2) x--;
    x = Math.floor(x / 10);
    quadrants[y][x].add(xyToString(position));
  }

  for (const line of quadrants) {
    for (let i = 0; i < line.length / 2; i++) {
      if (Math.abs(line[i].size - line[line.length - 1 - i].size) > 3) {
        return false;
      }
    }
  }
  return true;
};

const logMap = () => {
  const map = Array.from({ length: size.y }, () =>
    Array.from({ length: size.x }, () => 0)
  );
  for (let { position } of robots) {
    position = moduloXY(addXY(position, size), size);
    map[position.y][position.x] += 1;
  }

  const string = map
    .map((row) => row.map((value) => (value ? value.toString() : ".")).join(""))
    .join("\n");
  console.log(string);
};

let i = 0;
while (true) {
  if (!(i % 5e4)) {
    // logMap();
    console.log(i);
  }
  i++;
  robots = robots.map(getNewPosition);
  if (couldBeChristmasTree()) {
    console.log("could be christmas tree", i);
    logMap();
  }
}
