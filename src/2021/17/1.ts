import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');


const yText = textInput.split('\n')[0].split('target area: x=')[1].split(', y=')[1];
const minY = yText.split('..').map(Number)[0];


// We can always find a x velocity such as the x velocity at the target is 0.
// The x velocity doesn't impact the y velocity and height, so we only need to
// work on the y velocity.
//
// When going up from y=0, on the way done, the probe will always go through the
// position `y=0` with a velocity of `-yVelocity - 1`. The maximum y velocity on
// the way done when `y=0` is `abs(minY) - 1` (faster will overshoot).

const maxYVelocity = Math.abs(minY) - 1;

// The maximum height is `sum[n=1 -> n=initialVelocity](n) = (initialVelocity * (initialVelocity + 1)) / 2`.

const result = (maxYVelocity * (maxYVelocity + 1)) / 2;

console.log(result); // 35511
