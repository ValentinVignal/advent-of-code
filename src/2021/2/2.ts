import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Direction = 'forward' | 'down' | 'up';
type Delta = {
  direction: Direction;
  x: number;
}

const input: Delta[] = textInput.split('\n').filter(Boolean).map((l) => {
  const [direction, xString] = l.split(' ');
  const x = parseInt(xString);
  return {
    direction: direction as Direction,
    x,
  }
});


type State = {
  x: number;
  y: number;
  aim: number;
}

const state: State = input.reduce((acc, delta) => {
  switch (delta.direction) {
    case 'forward':
      return {
        ...acc,
        x: acc.x + delta.x,
        y: acc.y + delta.x * acc.aim,
      };
    case 'down':
      return {
        ...acc,
        aim: acc.aim + delta.x,
      }
    case 'up':
      return {
        ...acc,
        aim: acc.aim - delta.x,
      };
  }
}, { x: 0, y: 0, aim: 0 });

console.log(state.x * state.y); // 2105273490
