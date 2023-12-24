import { readFileSync } from "fs";
import * as path from "path";
import {
  XYZ,
  addXYZ,
  equalXYZ,
  getInnerProduct,
  lineDistance,
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
const [_, __, hail2, hail3] = hails;

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

// From the graphs, it looks like the first impact is around 3.8e11ns and the
// second around 5.8e11ns.
const estimatedImpactTime0 = 3.8e11;
const estimatedImpactTime1 = 5.8e11;

const hail0 = hails[5];

const hail1 = hails[8];

enum Direction {
  Up,
  Down,
}

enum PointIndex {
  Zero,
  One,
}

let delta = 2 ** 30;

let hail0Time = estimatedImpactTime0;
let hail1Time = estimatedImpactTime1;

let direction: Direction = Direction.Up;
let pointToMove: PointIndex = PointIndex.Zero;

const getDistance = (time0: number, time1: number): number => {
  const impactPosition0 = addXYZ(
    hail0.position,
    multiplyXYZ(time0, hail0.velocity)
  );
  const impactPosition1 = addXYZ(
    hail1.position,
    multiplyXYZ(time1, hail1.velocity)
  );
  const direction = multiplyXYZ(
    1 / (time1 - time0),
    addXYZ(impactPosition1, multiplyXYZ(-1, impactPosition0))
  );

  return hails
    .slice(0, 5)
    .map((hail) =>
      lineDistance(
        {
          origin: impactPosition0,
          direction,
        },
        {
          origin: hail.position,
          direction: hail.velocity,
        }
      )
    )
    .reduce((a, b) => a + b, 0);
};

let distance = getDistance(hail0Time, hail1Time);

while (true) {
  const deltaTime = direction === Direction.Up ? delta : -delta;
  const time0 = hail0Time + (pointToMove === PointIndex.Zero ? deltaTime : 0);
  const time1 = hail1Time + (pointToMove === PointIndex.One ? deltaTime : 0);

  const newDistance = getDistance(time0, time1);

  if (newDistance < distance) {
    distance = newDistance;
    hail0Time = time0;
    hail1Time = time1;
    if (distance === 0) {
      break;
    }
  } else {
    direction = direction === Direction.Up ? Direction.Down : Direction.Up;
    if (direction === Direction.Up) {
      pointToMove =
        pointToMove === PointIndex.Zero ? PointIndex.One : PointIndex.Zero;
      if (pointToMove === PointIndex.Zero) {
        delta /= 2;
        if (delta < 0.5) {
          break;
        }
      }
    }
  }
}

const hail1ImpactPosition = addXYZ(
  hail1.position,
  multiplyXYZ(hail1Time, hail1.velocity)
);

const hail0ImpactPosition = addXYZ(
  hail0.position,
  multiplyXYZ(hail0Time, hail0.velocity)
);

const deltaTime = hail1Time - hail0Time;
const velocity = multiplyXYZ(
  1 / deltaTime,
  addXYZ(hail1ImpactPosition, multiplyXYZ(-1, hail0ImpactPosition))
);

const position = addXYZ(hail0ImpactPosition, multiplyXYZ(-hail0Time, velocity));

console.log("position", position, "velocity", velocity);

const result =
  Math.round(position.x) + Math.round(position.y) + Math.round(position.z);

// 848709528018155 < X
console.log(result); // 848947587263033
