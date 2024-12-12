import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Garden = string[][];

const garden: Garden = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean));

type XY = {
  x: number;
  y: number;
};

type Point = XY & {
  label: string;
};

const pointsToVisit: Point[] = [
  {
    x: 0,
    y: 0,
    label: garden[0][0],
  },
];

const xyToString = ({ x, y }: XY) => `${x},${y}`;

const visited = new Set<string>();

const regions = new Map<string, Set<string>[]>();

while (pointsToVisit.length) {
  const pointToVisit = pointsToVisit.shift()!;

  const xyString = xyToString(pointToVisit);

  if (visited.has(xyString)) continue;

  visited.add(xyString);

  const neighbors: Point[] = [
    { x: pointToVisit.x - 1, y: pointToVisit.y },
    { x: pointToVisit.x + 1, y: pointToVisit.y },
    { x: pointToVisit.x, y: pointToVisit.y - 1 },
    { x: pointToVisit.x, y: pointToVisit.y + 1 },
  ]
    .filter((point) => {
      return (
        point.x >= 0 &&
        point.y >= 0 &&
        point.x < garden[0].length &&
        point.y < garden.length
      );
    })
    .map((point) => ({ ...point, label: garden[point.y][point.x] }));

  const sameRegion = neighbors.filter(
    (point) => point.label === pointToVisit.label
  );
  const otherRegion = neighbors.filter(
    (point) => point.label !== pointToVisit.label
  );

  pointsToVisit.splice(0, 0, ...sameRegion);
  pointsToVisit.push(...otherRegion);

  if (!regions.has(pointToVisit.label)) {
    regions.set(pointToVisit.label, []);
  }
  let needNewRegion = true;
  if (sameRegion.length) {
    // Check if we are adding a new region or we can use an existing one.
    const neighborsXYString = sameRegion.map(xyToString);
    const possibleRegions = regions.get(pointToVisit.label)!;

    for (const possibleRegion of possibleRegions) {
      if (neighborsXYString.some((xy) => possibleRegion.has(xy))) {
        possibleRegion.add(xyString);
        needNewRegion = false;
        break;
      }
    }
  }
  if (needNewRegion) {
    const newRegion = new Set<string>([xyString]);
    regions.get(pointToVisit.label)!.push(newRegion);
  }
}

const stringToXY = (xyString: string): XY => {
  const [x, y] = xyString.split(",").map(Number);
  return { x, y };
};

const getRegionScore = (region: Set<string>): number => {
  const xys = [...region].map(stringToXY);

  const area = region.size;

  const maxX = Math.max(...xys.map((xy) => xy.x));
  const maxY = Math.max(...xys.map((xy) => xy.y));
  const minX = Math.min(...xys.map((xy) => xy.x));
  const minY = Math.min(...xys.map((xy) => xy.y));

  enum Direction {
    In,
    Out,
  }

  type Fence = {
    start: XY; // Included
    length: number;
    direction: Direction;
  };

  /**
   * The point on top of the fence.
   */
  const horizontalFences: Fence[] = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY - 1; y <= maxY; y++) {
      const first = { x, y };
      const second = { x, y: y + 1 };
      const firstString = xyToString(first);
      const secondString = xyToString(second);
      if (region.has(firstString) !== region.has(secondString)) {
        horizontalFences.push({
          start: first,
          length: 1,
          direction: region.has(firstString) ? Direction.Out : Direction.In,
        });
      }
    }
  }

  /** The point on the left of the fence. */
  const verticalFences: Fence[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX - 1; x <= maxX; x++) {
      const first = { x, y };
      const second = { x: x + 1, y };
      const firstString = xyToString(first);
      const secondString = xyToString(second);
      if (region.has(firstString) !== region.has(secondString)) {
        verticalFences.push({
          start: first,
          length: 1,
          direction: region.has(firstString) ? Direction.Out : Direction.In,
        });
      }
    }
  }

  // Reduce the fences.

  let hasChange = true;

  while (hasChange) {
    hasChange = false;
    for (const fence of horizontalFences) {
      const index = horizontalFences.findIndex(
        (otherFence) =>
          fence.start.y === otherFence.start.y &&
          fence.direction === otherFence.direction &&
          fence.start.x + fence.length === otherFence.start.x
      );
      if (index !== -1) {
        const otherFence = horizontalFences[index];
        fence.length += otherFence.length;
        horizontalFences.splice(index, 1);
        hasChange = true;
        break;
      }
    }
  }

  hasChange = true;
  while (hasChange) {
    hasChange = false;
    for (const fence of verticalFences) {
      const index = verticalFences.findIndex(
        (otherFence) =>
          fence.start.x === otherFence.start.x &&
          fence.direction === otherFence.direction &&
          fence.start.y + fence.length === otherFence.start.y
      );
      if (index !== -1) {
        const otherFence = verticalFences[index];
        fence.length += otherFence.length;
        verticalFences.splice(index, 1);
        hasChange = true;
        break;
      }
    }
  }

  return area * (horizontalFences.length + verticalFences.length);
};

const result = [...regions.values()]
  .flat()
  .reduce((acc, region) => acc + getRegionScore(region), 0);

// 890206 < x
console.log(result); // 899196
