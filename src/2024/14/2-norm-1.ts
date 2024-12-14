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

const multiplyXY = (a: XY, b: number): XY => ({ x: a.x * b, y: a.y * b });

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

let maxScore = 0;

const norm = (v: XY): number => {
  const origin = { x: (size.x - 1) / 2, y: size.y - 1 };
  const vFromOrigin = addXY(v, multiplyXY(origin, -1));
  const normalizedV = {
    x: Math.abs(vFromOrigin.x) / (size.x - 1),
    y: Math.abs(vFromOrigin.y) / (size.y - 1),
  };

  const n = 1 - (normalizedV.x + normalizedV.y) / 2;

  return n;
};

/**
 * A Christmas tree is vertically symmetrical.
 */
const couldBeChristmasTree = (): boolean => {
  const quadrants = Array.from({ length: 10 }).map(() =>
    Array.from({ length: 10 }).map(() => new Set<string>())
  );

  // Fill the quadrants.
  for (const { position } of robots) {
    let y = Math.floor(position.y / 10);
    y = Math.min(y, 9);
    let x = position.x;
    if (x === (size.x - 1) / 2) continue;
    if (x > (size.x - 1) / 2) x--;
    x = Math.floor(x / 10);
    quadrants[y][x].add(xyToString(position));
  }

  let score = 0;

  for (const { position } of robots) {
    score += norm(position);
  }

  if (score > maxScore) maxScore = score;
  if (score > 0.95 * maxScore) {
    console.log("could be christmas tree", score, maxScore);
    return true;
  }
  return false;
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
