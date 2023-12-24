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

// math.stackexchange.com/questions/2213165/find-shortest-distance-between-lines-in-3d

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

// From the graphs, it looks like the first impact is around 3.8e11ns and the
// second around 5.8e11ns.
const estimatedFirstImpactTime = 3.8e11;
const estimatedSecondImpactTime = 5.8e11;

type HailWithTime = Point & {
  time: number;
};

const hail0WithTime: HailWithTime = {
  ...hails[0],
  time: estimatedFirstImpactTime,
};

const hail1WithTime: HailWithTime = {
  ...hails[5],
  time: estimatedSecondImpactTime,
};

let dt = 20000; // > 20000

let result: Point | null = null;

while (!result) {
  dt++;
  if (dt % 10000 === 0) {
    console.log(dt);
  }

  for (const [h0, h1] of [
    [hail0WithTime, hail1WithTime],
    [hail1WithTime, hail0WithTime],
  ]) {
    for (const dt0 of [-dt, dt]) {
      for (let dt1 = -dt; dt1 <= dt; dt1++) {
        const t0 = h0.time + dt0;
        const t1 = h1.time + dt1;
        const positionAtT1 = addXYZ(h0.position, multiplyXYZ(t0, h0.velocity));
        const positionAtT2 = addXYZ(h1.position, multiplyXYZ(t1, h1.velocity));
        const velocity = multiplyXYZ(
          1 / (t1 - t0),
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
}

console.log("stone", result);

console.log(result.position.x + result.position.y + result.position.z);
