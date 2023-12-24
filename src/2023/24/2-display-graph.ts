import { readFileSync } from "fs";
import { Plot, plot } from "nodeplotlib";
import * as path from "path";
import { XYZ, addXYZ, multiplyXYZ } from "./2-utils";

// https://math.stackexchange.com/questions/607348/line-intersecting-three-or-four-given-lines
// http://ogigi.polsl.pl/biuletyny/zeszyt_18/z18_1_1.pdf

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Point = {
  position: XYZ;
  velocity: XYZ;
};

const hails: Point[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [position, velocity] = line.split(" @ ").map((part) => {
      const [x, y, z] = part.split(", ").map(Number);
      return { x, y, z };
    });

    return { position, velocity };
  });

let maxPX = -Infinity;
let minPX = Infinity;
let maxPY = -Infinity;
let minPY = Infinity;
let maxPZ = -Infinity;
let minPZ = Infinity;
let maxVX = -Infinity;
let minVX = Infinity;
let maxVY = -Infinity;
let minVY = Infinity;
let maxVZ = -Infinity;
let minVZ = Infinity;

for (const hail of hails) {
  maxPX = Math.max(maxPX, hail.position.x);
  minPX = Math.min(minPX, hail.position.x);
  maxPY = Math.max(maxPY, hail.position.y);
  minPY = Math.min(minPY, hail.position.y);
  maxPZ = Math.max(maxPZ, hail.position.z);
  minPZ = Math.min(minPZ, hail.position.z);
  maxVX = Math.max(maxVX, hail.velocity.x);
  minVX = Math.min(minVX, hail.velocity.x);
  maxVY = Math.max(maxVY, hail.velocity.y);
  minVY = Math.min(minVY, hail.velocity.y);
  maxVZ = Math.max(maxVZ, hail.velocity.z);
  minVZ = Math.min(minVZ, hail.velocity.z);
}

console.log(
  "maxPX",
  maxPX,
  "minPX",
  minPX,
  "maxPY",
  maxPY,
  "minPY",
  minPY,
  "maxPZ",
  maxPZ,
  "minPZ",
  minPZ,
  "maxVX",
  maxVX,
  "minVX",
  minVX,
  "maxVY",
  maxVY,
  "minVY",
  minVY,
  "maxVZ",
  maxVZ,
  "minVZ",
  minVZ
);

const selectedHails = [
  ...hails.slice(0, 4),
  hails[59],
  hails[126],
  hails[151],
  hails[271],
];

const firstPoint = addXYZ(
  selectedHails[0].position,
  multiplyXYZ(5.5e11, selectedHails[0].velocity)
);
const secondPoint = addXYZ(
  selectedHails[1].position,
  multiplyXYZ(5e11, selectedHails[1].velocity)
);

const points: Plot[] = [
  ...selectedHails
    .map((hail) => {
      return [
        addXYZ(hail.position, multiplyXYZ(0, hail.velocity)),
        addXYZ(hail.position, multiplyXYZ(1e12, hail.velocity)),
      ];
    })
    .map(([p1, p2]) => {
      console.log("p1", p1, "p2", p2);
      return {
        x: [p1.x, p2.x],
        y: [p1.y, p2.y],
        z: [p1.z, p2.z],
        type: "scatter3d" as const,
      };
    }),
  {
    x: [firstPoint.x, secondPoint.x],
    y: [firstPoint.y, secondPoint.y],
    z: [firstPoint.z, secondPoint.z],
    type: "scatter3d",
  },
];

console.log(points);

plot(points);
