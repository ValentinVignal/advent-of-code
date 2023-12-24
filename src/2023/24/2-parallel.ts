import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type XY = { x: number; y: number };

type XYZ = XY & { z: number };

type Hail2 = {
  position: XY;
  velocity: XY;
};

type Hail = {
  position: XYZ;
  velocity: XYZ;
};

const epsilon = 10 ** -20;

const almostEqual = (a: number, b: number) => Math.abs((a - b) / a) < epsilon;

const getMB = ({ position, velocity }: Hail2) => {
  const m = velocity.y / velocity.x;
  const b = position.y - m * position.x;
  return { m, b };
};

const hails: Hail[] = textInput
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
 * 3 hails with that are parallel in the y axis.
 *
 * ```ts
 * [
 *   {
 *     position: { x: 225944837742569, y: 211715219588521, z: 420222266544563 },
 *     velocity: { x: 36, y: 36, z: -22 }
 *   },
 *   {
 *     position: { x: 242927595383883, y: 224413358502179, z: 405822693648721 },
 *     velocity: { x: 9, y: 9, z: 17 }
 *   },
 *   {
 *     position: { x: 319955313134293, y: 335288225094987, z: 245805805739537 },
 *     velocity: { x: -46, y: -46, z: 13 }
 *   }
 * ]
 * ```
 *
 * But rotating them so they align with the x axis:
 *
 * ```
 *                                    <---------+ 2
 *
 *      0 +----->
 *
 *             1 +-->
 * ```
 *
 * The stone can only "start" from 2 or 3.
 */
const subsetHails = [hails[64], hails[199], hails[209]] as const;

const mbs = subsetHails.map(getMB);

const addXY = (a: XY, b: XY) => ({ x: a.x + b.x, y: a.y + b.y });

const multiplyXY = (time: number, velocity: XY) => ({
  x: time * velocity.x,
  y: time * velocity.y,
});

/**
 * The time of the first impact
 */
let timeStart = 0;
let deltaStartTime = 2 ** 36;

let result: Hail2 | null = null;

while (!result) {
  console.log("timeStart", timeStart);
  // We first consider starting from 1;
  const pos1 = addXY(
    subsetHails[1].position,
    multiplyXY(timeStart, subsetHails[1].velocity)
  );

  /**
   * The time from the first impact to the 2nd impact.
   */
  let deltaTime1 = 1;
  let deltaDeltaTime1 = 2 ** 12;
  while (true) {
    const pos0 = addXY(
      subsetHails[0].position,
      multiplyXY(timeStart + deltaTime1, subsetHails[0].velocity)
    );

    const velocity = multiplyXY(
      1 / deltaTime1,
      addXY(pos0, multiplyXY(-1, pos1))
    );

    // We now need to check if it impacts the last hail.

    const m = velocity.y / velocity.x;
    const b = pos0.y - m * pos0.x;

    const otherMb = mbs[2];

    const xCollision = (otherMb.b - b) / (m - otherMb.m);

    /** The time between the 2st and 3rd impacts. */
    const deltaTime2 = (xCollision - pos0.x) / velocity.x;

    const pos2 = addXY(
      subsetHails[2].position,
      multiplyXY(timeStart + deltaTime1 + deltaTime2, subsetHails[2].velocity)
    );

    if (
      almostEqual(pos2.x, xCollision) &&
      almostEqual(pos2.y, m * xCollision + b)
    ) {
      result = {
        position: pos0,
        velocity,
      };
      break;
    } else if (pos2.x < xCollision) {
      deltaDeltaTime1 /= 2;
      deltaDeltaTime1 -= deltaDeltaTime1;
    } else {
      deltaTime1 += deltaDeltaTime1;
    }
    if (deltaDeltaTime1 < 1) {
      break;
    }
  }
  if (deltaTime1 <= 1) {
    deltaStartTime /= 2;
    timeStart -= deltaStartTime;
  } else {
    timeStart += deltaStartTime;
  }
  if (deltaStartTime < 1) {
    break;
  }
}

console.log(result);

// Try on the other side.

timeStart = 0;
deltaStartTime = 2 ** 36;
while (!result) {
  console.log("timeStart", timeStart);
  // We first consider starting from 2;
  const pos2 = addXY(
    subsetHails[2].position,
    multiplyXY(timeStart, subsetHails[2].velocity)
  );

  /**
   * The time from the first impact to the 2nd impact.
   */
  let deltaTime1 = 1;
  let deltaDeltaTime1 = 2 ** 12;
  while (true) {
    const pos0 = addXY(
      subsetHails[0].position,
      multiplyXY(timeStart + deltaTime1, subsetHails[0].velocity)
    );

    const velocity = multiplyXY(
      1 / deltaTime1,
      addXY(pos0, multiplyXY(-1, pos2))
    );

    // We now need to check if it impacts the last hail.

    const m = velocity.y / velocity.x;
    const b = pos0.y - m * pos0.x;

    const otherMb = mbs[0];

    const xCollision = (otherMb.b - b) / (m - otherMb.m);

    /** The time between the 2st and 3rd impacts. */
    const deltaTime0 = (xCollision - pos0.x) / velocity.x;

    const pos1 = addXY(
      subsetHails[2].position,
      multiplyXY(timeStart + deltaTime1 + deltaTime0, subsetHails[2].velocity)
    );

    if (
      almostEqual(pos1.x, xCollision) &&
      almostEqual(pos1.y, m * xCollision + b)
    ) {
      result = {
        position: pos0,
        velocity,
      };
      break;
    } else if (pos1.x < xCollision) {
      // We are now too slow.
      deltaDeltaTime1 /= 2;
      deltaDeltaTime1 -= deltaDeltaTime1;
    } else {
      deltaTime1 += deltaDeltaTime1;
    }
    if (deltaDeltaTime1 < 1) {
      break;
    }
  }
  if (deltaTime1 < 1) {
    deltaStartTime /= 2;
    timeStart -= deltaStartTime;
  } else {
    timeStart += deltaStartTime;
  }
  if (deltaStartTime < 1) {
    break;
  }
}

console.log(result);
