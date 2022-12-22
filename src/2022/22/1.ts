import { readFileSync } from 'fs';
import * as path from 'path';


const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');
let [mapText, instructionsText] = textInput.split('\n\n');

instructionsText = instructionsText.split('\n').filter(Boolean)[0];

type CaseType = ' ' | '.' | '#';

// In the example and real input, the map is convex for the 4 directions (left, right, up, down).

const map: CaseType[][] = mapText.split('\n').filter(Boolean).map((line) => {
  return line.split('') as CaseType[];
});


const mapSize = { x: map.reduce((acc, line) => Math.max(acc, line.length), 0), y: map.length };

for (const line of map) {
  if (line.length < mapSize.x) {
    line.push(...new Array(mapSize.x - line.length).fill(' '));
  }
}

type Rotation = 'L' | 'R';
type Instruction = number | Rotation;

const re = /([0-9]+|R|L)/;

const instructions: Instruction[] = instructionsText.split(re).filter(Boolean).map((instruction) => {
  if (instruction.match(/(R|L)/)) return instruction as Rotation;
  return parseInt(instruction);
})

enum Orientation {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

type State = {
  x: number;
  y: number;
  orientation: Orientation;
}

let state: State = {
  y: 0,
  x: 0,
  orientation: Orientation.Right,
}

const mod = (x: number, m: number) => {
  return ((x % m) + m) % m;
}

const rotate = (rotation: Rotation) => {
  const newOrientation = mod(state.orientation + (rotation === 'L' ? -1 : 1), 4);
  state.orientation = newOrientation < 0 ? newOrientation + 4 : newOrientation;

}


/** Do **1** move. */
const move = () => {
  switch (state.orientation) {
    case Orientation.Up:
    case Orientation.Down: {
      let y = state.y;
      const nextY = () => {
        const deltaY = state.orientation === Orientation.Up ? -1 : 1;
        y = mod(y + deltaY, mapSize.y);
      }
      nextY();
      let canContinue = true;
      while (canContinue) {
        switch (map[y][state.x]) {
          case '.':
            // Nothing to do, we are going to move.
            canContinue = false;
            break;
          case '#':
            // We cannot move.
            y = state.y;
            canContinue = false;
            break;
          case ' ':
            // We need to look forward as the map wraps.
            nextY();
            break;
        }
      }
      state.y = y;
      break;
    }
    case Orientation.Right:
    case Orientation.Left: {
      let x = state.x;
      const nextX = () => {
        const deltaX = state.orientation === Orientation.Left ? -1 : 1;
        x = mod(x + deltaX, mapSize.x);
      }
      nextX();
      let canContinue = true;
      while (canContinue) {
        switch (map[state.y][x]) {
          case '.':
            // Nothing to do, we are going to move.
            canContinue = false;
            break;
          case '#':
            // We cannot move.
            x = state.x;
            canContinue = false;
            break;
          case ' ':
            // We need to look forward as the map wraps.
            nextX();
            break;
        }
      }
      state.x = x;
      break;
    }
  }
}



for (const instruction of instructions) {
  if (typeof instruction === 'string') {
    rotate(instruction);
  } else {
    for (let i = 0; i < instruction; i++) {
      move();
    }
  }
}



const result = 1000 * (state.y + 1) + 4 * (state.x + 1) + state.orientation;
console.log(result); // 196134


