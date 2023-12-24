import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type XY = { x: number; y: number };

type Hail = {
  position: XY;
  velocity: XY;
};

const hails: Hail[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [position, velocity] = line.split(" @ ").map((part) => {
      const [x, y] = part.split(", ").map(Number);
      return { x, y };
    });

    return { position, velocity };
  });

const getM = (velocity: XY) => {
  const { x, y } = velocity;
  // There is no need to check for division by zero, as the input doesn't
  // contain any `0`.
  return y / x;
};

const epsilon = 10 ** -6;

const range = {
  start: example ? 7 : 200000000000000,
  end: example ? 27 : 400000000000000,
};

const result = hails
  .map((hail, index) => {
    const m = getM(hail.velocity);
    const b = hail.position.y - m * hail.position.x;

    return hails.slice(index + 1).filter((otherHail) => {
      const otherM = getM(otherHail.velocity);
      const otherB = otherHail.position.y - otherM * otherHail.position.x;
      if (Math.abs(m - otherM) < epsilon) {
        // They are parallel.
        if (Math.abs(b - otherB) > epsilon) {
          // They are not on the same line.
          return false;
        }
        // They are on the same line. We now need the line to be in the range.
        const y0 = m * range.start + b;
        const y1 = m * range.end + b;
        if (
          (y0 < range.start && y1 < range.start) ||
          (y0 > range.end && y1 > range.end)
        ) {
          // It doesn't intersect the range.
          return false;
        } else {
          return true;
        }
      } else {
        // They are not parallel.

        const xCollision = (otherB - b) / (m - otherM);

        if (xCollision < range.start || xCollision > range.end) {
          return false;
        }

        if (
          Math.sign(hail.velocity.x) !== Math.sign(xCollision - hail.position.x)
        ) {
          // The intersection is in the past for the hail.
          return false;
        }
        if (
          Math.sign(otherHail.velocity.x) !==
          Math.sign(xCollision - otherHail.position.x)
        ) {
          // The intersection is in the past for the other hail.
          return false;
        }

        const yCollision = m * xCollision + b;
        if (yCollision < range.start || yCollision > range.end) {
          return false;
        }
        const otherYCollision = otherM * xCollision + otherB;
        if (Math.abs((yCollision - otherYCollision) / yCollision) > epsilon) {
          return false;
        }
        return true;
      }
    }).length;
  })
  .reduce((acc, cur) => acc + cur, 0);

// 300 < 9392 < x
console.log(result); // 29142
