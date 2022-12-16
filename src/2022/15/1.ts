import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Point = { x: number; y: number };
type Pair = { s: Point, b: Point };

const pointFromString = (s: string): Point => {
  const [x, y] = s.split(', y=').map((x) => parseInt(x));
  return { x, y };
}

const pairs: Pair[] = textInput.split('\n').filter((l) => l).map((line) => {
  const [s, b] = line.substring(12).split(': closest beacon is at x=').map((s) => pointFromString(s));
  return { s, b }

});

/**
 * The line number for the output. 
 */
const yLine = 2000000;


const distance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const points = new Set<number>();

for (const { s, b } of pairs) {
  // We are counting positions with no beacon.
  const beaconDistance = distance(s, b);
  const distanceToLine = distance(s, { x: s.x, y: yLine });
  const delta = beaconDistance - distanceToLine;
  if (delta >= 0) {
    for (let d = -delta; d <= delta; d++) {
      points.add(s.x + d);
    }
  }
}

// Remove the already known beacons
for (const { b } of pairs) {
  if (b.y === yLine) {
    points.delete(b.x);
  }
}

console.log(points.size);

