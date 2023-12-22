import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Position = {
  x: number;
  y: number;
  z: number;
};

type Brick = {
  start: Position;
  end: Position;
};

const bricks = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [start, end] = line
      .split("~")
      .filter(Boolean)
      .map((point) => {
        const [x, y, z] = point.split(",").filter(Boolean).map(Number);
        return { x, y, z } as Position;
      });
    return {
      start,
      end,
    } as Brick;
  });

type FullBrick = {
  id: number;
  cubes: Position[];
};

let fullBricks: FullBrick[] = bricks.map((brick, index) => {
  const cubes = [];
  for (let x = brick.start.x; x <= brick.end.x; x++) {
    for (let y = brick.start.y; y <= brick.end.y; y++) {
      for (let z = brick.start.z; z <= brick.end.z; z++) {
        cubes.push({ x, y, z });
      }
    }
  }
  return {
    id: index,
    cubes,
  };
});

const isBellowAtDistance = (
  brickAbove: FullBrick,
  brickBellow: FullBrick
): number | null => {
  const allXYAbove = brickAbove.cubes.map(({ x, y }) => `${x},${y}`);
  const allXYBellow = brickBellow.cubes.map(({ x, y }) => `${x},${y}`);

  const commonXY = allXYAbove.filter((xy) => allXYBellow.includes(xy));
  if (!commonXY.length) return null; // They are not directly above each other.

  let distance = Infinity;
  for (const cubeAbove of brickAbove.cubes) {
    for (const cubeBellow of brickBellow.cubes) {
      if (distance === 0) return 0;
      if (
        cubeAbove.x === cubeBellow.x &&
        cubeAbove.y === cubeBellow.y &&
        cubeAbove.z > cubeBellow.z
      ) {
        distance = Math.min(distance, cubeAbove.z - cubeBellow.z - 1);
      }
    }
  }
  if (isFinite(distance)) {
    return distance;
  } else {
    return null;
  }
};

const getLowestZ = (brick: FullBrick): number => {
  return Math.min(...brick.cubes.map(({ z }) => z));
};

const fallBricks = (
  bricks: FullBrick[]
): { fallen: Set<number>; bricks: FullBrick[] } => {
  const newBricks = structuredClone(bricks);
  const fallen = new Set<number>();
  for (const brick of newBricks) {
    const lowestZ = getLowestZ(brick);
    if (lowestZ === 1) continue; // Already on the ground.

    let minDistance = lowestZ - 1;

    for (const otherBrick of newBricks) {
      if (minDistance === 0) break;
      if (brick.id === otherBrick.id) continue; // Same brick.

      const distance = isBellowAtDistance(brick, otherBrick);
      if (distance !== null) {
        minDistance = Math.min(minDistance, distance);
      }
    }
    if (minDistance > 0) {
      fallen.add(brick.id);
      brick.cubes.forEach((cube) => {
        cube.z -= minDistance;
      });
    }
  }
  return {
    fallen,
    bricks: newBricks,
  };
};

const fall = (
  bricks: FullBrick[],
  log: boolean
): { fallen: number; bricks: FullBrick[] } => {
  let fullBricks = bricks;
  let hasFallen = true;
  const fallen = new Set<number>();
  while (hasFallen) {
    const res = fallBricks(fullBricks);
    if (log) console.log(res.fallen.size);
    hasFallen = res.fallen.size > 0;
    for (const id of res.fallen) {
      fallen.add(id);
    }
    fullBricks = res.bricks;
  }
  return {
    fallen: fallen.size,
    bricks: fullBricks,
  };
};

const fallen = fall(fullBricks, true);
fullBricks = fallen.bricks;

const fallenBricks = fullBricks.map((brick, index) => {
  if (!(index % 50)) {
    console.log("Checking brick", index);
  }
  const { fallen } = fall(
    fullBricks.filter(({ id }) => id !== brick.id),
    false
  );
  if (!(index % 50)) {
    console.log("fallen", fallen);
  }
  return fallen;
});

const result = fallenBricks.reduce((acc, curr) => acc + curr, 0);

// 1849 < x
console.log(result); // 72352
