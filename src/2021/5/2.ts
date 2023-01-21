import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Point = {
  x: number;
  y: number;
}

const input: [Point, Point][] = textInput.split('\n').filter(Boolean).map((line) => {
  const [start, end] = line.split(' -> ').map((point) => {
    const [x, y] = point.split(',').map((num) => parseInt(num));
    return { x, y };
  });
  return [start, end];
});

const isVerticalLine = (point1: Point, point2: Point): boolean => {
  return point1.x === point2.x;
}

const isHorizontalLine = (point1: Point, point2: Point): boolean => {
  return point1.y === point2.y;
}

const map = new Map<string, number>();

const pointToKey = (point: Point): string => {
  return `${point.x},${point.y}`;
}

for (const [start, end] of input) {
  if (isHorizontalLine(start, end)) {
    for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
      const key = pointToKey({ x, y: start.y });
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  } else if (isVerticalLine(start, end)) {
    for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
      const key = pointToKey({ x: start.x, y });
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  } else {
    // This is a 45 degrees diagonal line.
    const xDelta = start.x < end.x ? 1 : -1;
    const yDelta = start.y < end.y ? 1 : -1;
    for (let delta = 0; delta <= Math.abs(start.x - end.x); delta++) {
      const key = pointToKey({ x: start.x + delta * xDelta, y: start.y + delta * yDelta });
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
}

const result = [...map.values()].filter((value) => value > 1).length;

console.log(result); // 19258
