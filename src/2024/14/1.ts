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

const robots: Robot[] = textInput
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

const newPosition = robots.map((robot) => {
  return moduloXY(addXY(robot.position, multiplyXY(robot.velocity, 100)), size);
});

const counts: [number, number, number, number] = [0, 0, 0, 0];

for (let position of newPosition) {
  position = moduloXY(addXY(position, size), size);
  position = moduloXY(addXY(position, size), size);
  const xMiddle = (size.x - 1) / 2;
  const yMiddle = (size.y - 1) / 2;
  if (position.x < xMiddle) {
    if (position.y < yMiddle) {
      counts[0]++;
    } else if (position.y > yMiddle) {
      counts[1]++;
    }
  } else if (position.x > xMiddle) {
    if (position.y < yMiddle) {
      counts[2]++;
    } else if (position.y > yMiddle) {
      counts[3]++;
    }
  }
}

const logMap = () => {
  if (!example) return;
  const map = Array.from({ length: size.y }, () =>
    Array.from({ length: size.x }, () => 0)
  );
  for (let position of newPosition) {
    position = moduloXY(addXY(position, size), size);
    map[position.y][position.x] += 1;
  }

  const string = map
    .map((row) => row.map((value) => (value ? value.toString() : ".")).join(""))
    .join("\n");
  console.log(string);
};

logMap();

console.log(counts);

const result = counts.reduce((acc, count) => acc * count, 1);

// x != 223298145
console.log(result); // 229632480
