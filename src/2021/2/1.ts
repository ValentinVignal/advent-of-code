import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Direction = 'forward' | 'down' | 'up';
type Delta = {
  y: number;
  x: number;
}

const input: Delta[] = textInput.split('\n').filter(Boolean).map((l) => {
  const [direction, xString] = l.split(' ');
  const x = parseInt(xString);
  switch (direction as Direction) {
    case 'forward':
      return { x, y: 0 };
    case 'down':
      return { x: 0, y: x };
    case 'up':
      return { x: 0, y: -x };
  }
});

const position: Delta = input.reduce((acc, delta) => {
  return {
    x: acc.x + delta.x,
    y: acc.y + delta.y,
  };
}, { x: 0, y: 0 });

console.log(position.x * position.y); // 2322630
