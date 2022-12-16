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

const distance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}


for (const { s: sensor, b: beacon } of pairs) {
  // For all the beacons, look at the frontiers.
  const beaconDistance = distance(sensor, beacon);
  const frontierDistance = beaconDistance + 1;
  for (let x = - frontierDistance; x <= frontierDistance; x++) {
    const y0 = frontierDistance - x;
    const y1 = -y0;
    for (const y of [y0, y1]) {
      // Verify it is not in the range of any sensor.
      const point = { x: sensor.x + x, y: sensor.y + y };
      if (point.x < 0 || point.x > 4000000 || point.y < 0 || point.y > 4000000) {
        // This is out of the boundaries.
        continue;
      }
      const isOutOfReach = pairs.every(({ s, b }) => distance(s, point) > distance(s, b));
      if (isOutOfReach) {
        console.log(point, 4000000 * point.x + point.y);
      }

    }

  }

}

