import { readFileSync } from "fs";
import * as path from "path";
import {
  XYZ,
  addXYZ,
  equalXYZ,
  fromXYZTo3DArray,
  getInnerProduct,
  multiplyXYZ,
} from "./2-utils";

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

/**
 * We are going to try multiple solutions with `hail0` and `hail1`.
 *
 * Each solution will be tested with `hail2` and `hail3`. If the solution if
 * valid, it should be valid with all the hails.
 */
const [hail0, hail1, hail2, hail3] = hails;

/**
 * @returns `true` if the two hails collide.
 */
const collide = (hail0: Point, hail1: Point): boolean => {
  const velocityDifference = addXYZ(
    hail0.velocity,
    multiplyXYZ(-1, hail1.velocity)
  );
  const normVelocityDifference = getInnerProduct(
    velocityDifference,
    velocityDifference
  );
  const positionDifference = addXYZ(
    hail1.position,
    multiplyXYZ(-1, hail0.position)
  );
  const collisionTime =
    getInnerProduct(positionDifference, velocityDifference) /
    normVelocityDifference;

  if (collisionTime < 0) {
    return false;
  }
  // Verify the solution.
  const hail0Position = addXYZ(
    hail0.position,
    multiplyXYZ(collisionTime, hail0.velocity)
  );
  const hail1Position = addXYZ(
    hail1.position,
    multiplyXYZ(collisionTime, hail1.velocity)
  );
  return equalXYZ(hail0Position, hail1Position);
};

/**
 * @returns `true` if the stone is a valid throw that collides with
 * {@link hail2} and {@link hail3}. By construction, it will also collide with
 * {@link hail0} and {@link hail1}.
 */
const isValidThrow = (stone: Point): boolean => {
  return collide(hail2, stone) && collide(hail3, stone);
};

/**
 *
 * @returns `true` if {@link xyz} only has integers that are smaller than the {@link Number.MAX_SAFE_INTEGER}.
 */
const isValidXYZ = (xyz: XYZ): boolean => {
  return fromXYZTo3DArray(xyz).every(
    (v) => Number.isInteger(v) && v < Number.MAX_SAFE_INTEGER
  );
};

/**
 * The sum  `t1 + t2` where `t1` is the time of the first impact and `t2` is the
 * time of the second impact.
 */
let tSum = 1780000; // > 840000

let result: Point | null = null;

while (!result) {
  tSum++;
  if (tSum % 10000 === 0) {
    console.log(tSum);
  }
  // We either hit hail0 first, then hail1; or hail1 first, then hail0.
  for (const [h0, h1] of [
    [hail0, hail1],
    [hail1, hail0],
  ]) {
    for (let t1 = 1; t1 < Math.floor(tSum / 2); t1++) {
      const t2 = tSum - t1;
      const positionAtT1 = addXYZ(h0.position, multiplyXYZ(t1, h0.velocity));
      const positionAtT2 = addXYZ(h1.position, multiplyXYZ(t2, h1.velocity));
      const velocity = multiplyXYZ(
        1 / (t2 - t1),
        addXYZ(positionAtT2, multiplyXYZ(-1, positionAtT1))
      );

      if (!isValidXYZ(velocity)) continue;

      if (fromXYZTo3DArray(velocity).some((v) => !Number.isInteger(v))) {
        continue;
      }
      const position = addXYZ(positionAtT1, multiplyXYZ(-t1, velocity));
      if (!isValidXYZ(position)) continue;

      const stone = {
        position,
        velocity,
      };
      if (isValidThrow(stone)) {
        result = stone;
        break;
      }
    }
  }
}

console.log("stone", result);

console.log(result.position.x + result.position.y + result.position.z);
