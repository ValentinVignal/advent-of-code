import { readFileSync } from 'fs';
import * as path from 'path';


const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type BlizzardType = '>' | '<' | '^' | 'v';


const textMap: string[][] = textInput.split('\n').filter(Boolean).map((line) => {
  return line.split('');
});

type Position = {
  x: number;
  y: number;
}

type Blizzard = Position & { type: BlizzardType };

let blizzards: Blizzard[] = [];

const emptyMap: ('#' | '.')[][] = Array.from(Array(textMap.length), () => Array(textMap[0].length).fill('.'));


for (const [y, line] of textMap.entries()) {
  for (const [x, tile] of line.entries()) {
    if (!['.', '#'].includes(tile)) {
      blizzards.push({ x, y, type: tile as BlizzardType });
    }
    if (tile === '#') {
      emptyMap[y][x] = '#';
    }
  }
}

const lengthX = textMap[0].length - 2;
const modX = (x: number): number => {
  return ((((x - 1) % lengthX) + lengthX) % lengthX) + 1;
}
const lengthY = textMap.length - 2;
const modY = (y: number): number => {
  return ((((y - 1) % lengthY) + lengthY) % lengthY) + 1;
}

const moveBlizzards = (blizzards: Blizzard[]): Blizzard[] => {
  const newBlizzards: Blizzard[] = [];
  for (const { x, y, type } of blizzards) {
    switch (type) {
      case '>':
        newBlizzards.push({ x: modX(x + 1), y, type });
        break;
      case '<':
        newBlizzards.push({ x: modX(x - 1), y, type });
        break;
      case '^':
        newBlizzards.push({ x, y: modY(y - 1), type });
        break;
      case 'v':
        newBlizzards.push({ x, y: modY(y + 1), type });
        break;
    }
  }
  return newBlizzards;
}

const start = { x: 1, y: 0 };
const end = { x: textMap[0].length - 2, y: textMap.length - 1 };


const positionToString = ({ x, y }: Position): string => `${x},${y}`;
const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(',').map(Number);
  return { x, y };
};

// const log = () => {
//   const map: string[][] = emptyMap.map((line) => [...line]);
//   for (const { x, y, type } of blizzards) {
//     map[y][x] = type;
//   }
//   for (const { x, y } of positions) {
//     map[y][x] = 'O';
//   }
//   console.log(map.map((line) => line.join('')).join('\n'));
// }


let positions: Position[] = [start];
let minute = 1;
while (true) {
  // if (minute < 20) {

  //   console.log('minute', minute);
  //   log();
  // }

  const newPositions: Position[] = [];
  // TODO: Stop if too far.
  // if (!(minute % 1000)) {
  //   console.log('i', minute, positions.length, minute);
  // }
  const newBlizzards = moveBlizzards(blizzards);

  for (const position of positions) {
    // Up:
    let canMoveUp = false;
    if (position.y > 1) {
      canMoveUp = !newBlizzards.some((blizzard) => blizzard.x === position.x && blizzard.y === position.y - 1);
    } else if (position.y === start.y + 1 && position.x === start.x) {
      // We can move up only to go back to the start.
      canMoveUp = true;
    }
    if (canMoveUp) {
      newPositions.push({ x: position.x, y: position.y - 1 });
    }

    // Down:
    let canMoveDown = false;
    if (position.y < end.y - 1) {
      canMoveDown = !newBlizzards.some((blizzard) => blizzard.x === position.x && blizzard.y === position.y + 1);
    } else if (position.y === end.y - 1 && position.x === end.x) {
      // We can move down only to go to the end.
      canMoveDown = true;
    }
    if (canMoveDown) {
      newPositions.push({ x: position.x, y: position.y + 1 });
    }

    // Left:
    let canMoveLeft = false;
    if (position.x > 1 && position.y !== start.y && position.y !== end.y) {
      canMoveLeft = !newBlizzards.some((blizzard) => blizzard.x === position.x - 1 && blizzard.y === position.y);
    }
    if (canMoveLeft) {
      newPositions.push({ x: position.x - 1, y: position.y });
    }

    // Right:
    let canMoveRight = false;
    if (position.x < end.x && position.y !== start.y && position.y !== end.y) {
      canMoveRight = !newBlizzards.some((blizzard) => blizzard.x === position.x + 1 && blizzard.y === position.y);
    }
    if (canMoveRight) {
      newPositions.push({ x: position.x + 1, y: position.y });
    }

    // No move:
    if (!newBlizzards.some((blizzard) => blizzard.x === position.x && blizzard.y === position.y)) {
      newPositions.push(position);
    }
  }
  if (newPositions.some((position) => position.x === end.x && position.y === end.y)) {
    console.log('Found', minute);
    break;
  }
  positions = newPositions.map(positionToString).filter((str, index, arr) => arr.indexOf(str) === index).map(stringToPosition);
  blizzards = newBlizzards;
  minute++;
}



