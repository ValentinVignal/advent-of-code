import { readFileSync } from "fs";
import * as path from "path";
import {
  Plane,
  XYZ,
  addXYZ,
  getCrossProduct,
  getInnerProduct,
  isPointInPlane,
  isVectorNull,
  multiplyXYZ,
} from "./2-utils";

// https://math.stackexchange.com/questions/607348/line-intersecting-three-or-four-given-lines
// http://ogigi.polsl.pl/biuletyny/zeszyt_18/z18_1_1.pdf

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Hail = {
  position: XYZ;
  velocity: XYZ;
};

type HailWithId = Hail & { id: number };

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
 * No planes are found were 2 hails are in the same plane.
 *
 * Therefore, there are no intersections and parallel lines.
 */
const planes: Plane[] = [];

/**
 * There are 2 * 2 hails that are orthogonal.
 *
 * ```ts
 * [
 *   [
 *     {
 *       position: { x: 263823868465163, y: 286943886503242, z: 239986850152598 },
 *       velocity: { x: 24, y: -12, z: 138 },
 *       id: 59
 *     },
 *     {
 *       position: { x: 319668156274635, y: 298695092535035, z: 279876171169163 },
 *       velocity: { x: -55, y: 5, z: 10 },
 *       id: 271
 *     }
 *   ],
 *   [
 *     {
 *       position: { x: 276779232042824, y: 216528625291195, z: 329068526005221 },
 *       velocity: { x: -5, y: 73, z: 29 },
 *       id: 126
 *     },
 *     {
 *       position: { x: 250387248971060, y: 262176077052140, z: 366537930003335 },
 *       velocity: { x: 43, y: 24, z: -53 },
 *       id: 151
 *     }
 *   ]
 * ]
 * ```
 */
const orthogonalHails: [HailWithId, HailWithId][] = [];

hails.forEach((hail, index) => {
  hails.slice(index + 1).forEach((otherHail, otherHailIndex) => {
    const otherHailId = otherHailIndex + index + 1;
    const crossProduct = getCrossProduct(hail.velocity, otherHail.velocity);
    if (isVectorNull(crossProduct)) {
      // The lines are parallel, therefore, they are in the same plane.

      const v1 = hail.velocity;
      const v2 = addXYZ(hail.position, multiplyXYZ(-1, otherHail.position));
      const normalV = getCrossProduct(v1, v2);
      planes.push({
        a: normalV.x,
        b: normalV.y,
        c: normalV.z,
        d:
          -normalV.x * hail.position.x -
          normalV.y * hail.position.y -
          normalV.z * hail.position.z,
      });
    } else {
      // The lines are not parallel, therefore, they are in the same plane if they intersect.
      const normalV = getCrossProduct(hail.velocity, otherHail.velocity);
      const plane: Plane = {
        a: normalV.x,
        b: normalV.y,
        c: normalV.z,
        d:
          -normalV.x * hail.position.x -
          normalV.y * hail.position.y -
          normalV.z * hail.position.z,
      };

      // Let's verify the other hail is in the plane.
      if (isPointInPlane(plane, otherHail.position)) {
        planes.push(plane);
      }
    }
    if (!getInnerProduct(hail.velocity, otherHail.velocity)) {
      orthogonalHails.push([
        { ...hail, id: index },
        { ...otherHail, id: otherHailId },
      ]);
    }
  });
});

// There are no parallel lines or lines that intersect.
console.log("planes", planes);

console.log(orthogonalHails.length);
console.dir(orthogonalHails, { depth: null });
