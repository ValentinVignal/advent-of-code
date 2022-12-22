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

console.log('map', map[100][99]);


/**
 * ```
 * {x: 200, y: 150}
 * ```
 */
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

const enum Orientation {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
};

type State = {
  x: number;
  y: number;
  orientation: Orientation;
}

let state: State = {
  y: 0,
  x: 50,
  orientation: Orientation.Right,
}

const stateToString = (state: State): string => {
  return `x: ${state.x}, y: ${state.y}, orientation: ${state.orientation}`;
}

const mod = (x: number, m: number) => {
  return ((x % m) + m) % m;
}

const rotate = (rotation: Rotation) => {
  const newOrientation = mod(state.orientation + (rotation === 'L' ? -1 : 1), 4);
  state.orientation = newOrientation < 0 ? newOrientation + 4 : newOrientation;

}


/**
 * Do **1** move. 
 * 
 * This would only work with my input shape:
 * 
 *     h---a---b
 *     |   |   |
 *     | 2 | 1 |
 *     |   |   |
 *     e---d---c
 *     |   |
 *     | 3 |
 *     |   |
 * e---f---c
 * |   |   |
 * | 5 | 4 |
 * |   |   |
 * h---g---b
 * |   |
 * | 6 |
 * |   |
 * a---b
*/
const move = () => {
  let newState: State;
  switch (state.orientation) {
    case Orientation.Up:
      if (state.y === 0) {
        // We will need a jump.
        if (state.x >= 100) {
          // 1 -> 6
          newState = {
            x: state.x - 100,
            y: mapSize.y - 1,
            orientation: Orientation.Up,
          };
        } else if (state.x >= 50) {
          // 50 <= x < 100.
          // 2 -> 6
          newState = {
            x: 0,
            y: 150 + (state.x - 50),
            orientation: Orientation.Right,
          };
        } else {
          throw new Error(`Unexpected state: ${stateToString(state)}`);
        }
      } else if (state.x < 50 && state.y === 100) {
        // 5 -> 3
        newState = {
          x: 50,
          y: 50 + state.x,
          orientation: Orientation.Right,
        };
      } else {
        // No jump is needed.
        newState = { ...state };
        newState.y--;
      }
      break;
    case Orientation.Down:
      if (state.y === mapSize.y - 1) {
        // 6 -> 1
        newState = {
          x: state.x + 100,
          y: 0,
          orientation: Orientation.Down,
        };
      } else if (state.y === 149 && state.x >= 50) {
        // 4 -> 6
        newState = {
          x: 49,
          y: 150 + (state.x - 50),
          orientation: Orientation.Left,
        };
      } else if (state.x >= 100 && state.y === 49) {
        // 1 -> 3
        newState = {
          x: 99,
          y: 50 + (state.x - 100),
          orientation: Orientation.Left,
        };
      } else {
        // No jump is needed.
        newState = { ...state };
        newState.y++;
      }
      break;
    case Orientation.Right:
      if (state.x === mapSize.x - 1) {
        // 1 -> 4
        newState = {
          x: 99,
          y: 100 + (49 - state.y),
          orientation: Orientation.Left,
        }
      } else if (state.x === 99 && state.y >= 50) {
        if (state.y < 100) {
          // 3 -> 1
          newState = {
            x: 100 + (state.y - 50),
            y: 49,
            orientation: Orientation.Up,
          };
        } else if (state.y < 150) {
          // 4 -> 1
          newState = {
            x: mapSize.x - 1,
            y: 49 - (state.y - 100),
            orientation: Orientation.Left,
          };
        } else {
          throw new Error(`Unexpected state: ${stateToString(state)}`);
        }
      } else if (state.x === 49 && state.y >= 150) {
        // 6 -> 4
        newState = {
          x: 50 + (state.y - 150),
          y: 149,
          orientation: Orientation.Up,
        };
      } else {
        // No jump is needed.
        newState = { ...state };
        newState.x++;
      }
      break;
    case Orientation.Left:
      if (state.x === 0) {
        if (state.y < 100) {
          throw new Error(`Unexpected state: ${stateToString(state)}`);
        } else if (state.y < 150) {
          // 5 -> 2
          newState = {
            x: 50,
            y: 49 - (state.y - 100),
            orientation: Orientation.Right,
          };
        } else {
          // 6 -> 2
          newState = {
            x: 50 + (state.y - 150),
            y: 0,
            orientation: Orientation.Down,
          };
        }
      } else if (state.x === 50 && state.y < 100) {
        if (state.y < 50) {
          // 2 -> 5
          newState = {
            x: 0,
            y: 100 + (49 - state.y),
            orientation: Orientation.Right,
          };
        } else {
          // 3 -> 5
          newState = {
            x: state.y - 50,
            y: 100,
            orientation: Orientation.Down,
          };
        }
      } else {
        // No jump is needed.
        newState = { ...state };
        newState.x--;
      }
      break;
  }

  if (map[newState.y][newState.x] === '.') {
    state = newState;
  } else if (map[newState.y][newState.x] === ' ') {
    throw Error(`Bad new state, ${stateToString(state)} -> ${stateToString(newState)}`);
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
console.log(result); // 146011


