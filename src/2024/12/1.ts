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

  let perimeter = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY - 1; y <= maxY; y++) {
      const first = { x, y };
      const second = { x, y: y + 1 };
      const firstString = xyToString(first);
      const secondString = xyToString(second);
      if (region.has(firstString) !== region.has(secondString)) {
        perimeter++;
      }
    }
  }

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX - 1; x <= maxX; x++) {
      const first = { x, y };
      const second = { x: x + 1, y };
      const firstString = xyToString(first);
      const secondString = xyToString(second);
      if (region.has(firstString) !== region.has(secondString)) {
        perimeter++;
      }
    }
  }

  return area * perimeter;
};

const result = [...regions.values()]
  .flat()
  .reduce((acc, region) => acc + getRegionScore(region), 0);

console.log(result); // 1485656
