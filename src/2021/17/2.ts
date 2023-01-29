import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');


const [xText, yText] = textInput.split('\n')[0].split('target area: x=')[1].split(', y=');
const [minX, maxX] = xText.split('..').map(Number);
const [minY, maxY] = yText.split('..').map(Number);

console.log(minX, maxX, minY, maxY);

// When going up from y=0, on the way done, the probe will always go through the
// position `y=0` with a velocity of `-yVelocity - 1`. The maximum y velocity on
// the way done when `y=0` is `abs(minY) - 1` (faster will overshoot).

const maxYVelocity = Math.abs(minY) - 1;

const possibleYVelocities = Array.from({ length: 2 * maxYVelocity + 3 }, (_, index) => index - maxYVelocity - 1);

const possibleXVelocities = Array.from({ length: maxX + 1 }, (_, index) => index);

type TwoD = {
  x: number;
  y: number;
}

const possibleVelocities: TwoD[] = [];

for (const xVelocity of possibleXVelocities) {
  for (const yVelocity of possibleYVelocities) {
    let velocity: TwoD = { x: xVelocity, y: yVelocity };
    let position: TwoD = { x: 0, y: 0 };
    while (true) {
      if (position.y < minY || position.x > maxX || (position.x < minX && velocity.x === 0)) {
        break;
      } else if (minX <= position.x && position.x <= maxX && minY <= position.y && position.y <= maxY) {
        possibleVelocities.push({ x: xVelocity, y: yVelocity });
        break;
      }
      position.x += velocity.x;
      position.y += velocity.y;
      velocity.y -= 1;
      velocity.x = Math.max(0, velocity.x - 1);
    }
  }
}

const result = possibleVelocities.length;


// 3245 < x
console.log(result); // 3282
