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

/**
 * 0: First trip.
 * 1: Going back for the snack.
 * 2: Second trip with the snacks.
 */
type Position2 = Position & { type: 0 | 1 | 2 };

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


const positionToString = ({ x, y, type }: Position2): string => `${x},${y},${type}`;
const stringToPosition = (str: string): Position2 => {
  const [x, y, type] = str.split(',').map(Number);
  return { x, y, type: type as 0 | 1 | 2 };
};

const log = () => {
  const map: string[][] = emptyMap.map((line) => [...line]);
  for (const { x, y, type } of blizzards) {
    map[y][x] = type;
  }
  for (const { x, y, type } of positions) {
    if (type === 0) {
      map[y][x] = '\x1b[1m\x1b[34mO\x1b[0m';
    } else if (type === 1) {
      map[y][x] = '\x1b[1m\x1b[33mO\x1b[0m';
    } else {
      map[y][x] = '\x1b[1m\x1b[35mO\x1b[0m';
    }
  }
  console.log(map.map((line) => line.join('')).join('\n'));
}


let positions: Position2[] = [{ ...start, type: 0 }];
let minute = 1;
while (true) {
  if (!(minute % 10)) {

    console.log('minute', minute);
    log();
  }

  const newPositions: Position2[] = [];
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
      newPositions.push({ ...position, y: position.y - 1 });
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
      newPositions.push({ ...position, y: position.y + 1 });
    }

    // Left:
    let canMoveLeft = false;
    if (position.x > 1 && position.y !== start.y && position.y !== end.y) {
      canMoveLeft = !newBlizzards.some((blizzard) => blizzard.x === position.x - 1 && blizzard.y === position.y);
    }
    if (canMoveLeft) {
      newPositions.push({ ...position, x: position.x - 1, });
    }

    // Right:
    let canMoveRight = false;
    if (position.x < end.x && position.y !== start.y && position.y !== end.y) {
      canMoveRight = !newBlizzards.some((blizzard) => blizzard.x === position.x + 1 && blizzard.y === position.y);
    }
    if (canMoveRight) {
      newPositions.push({ ...position, x: position.x + 1 });
    }

    // No move:
    if (!newBlizzards.some((blizzard) => blizzard.x === position.x && blizzard.y === position.y)) {
      newPositions.push(position);
    }
  }

  positions = newPositions.map(positionToString).filter((str, index, arr) => arr.indexOf(str) === index).map(stringToPosition).map(
    (position) => {
      if (position.x === end.x && position.y === end.y && position.type === 0) {
        return { ...position, type: 1 };
      } else if (position.x === start.x && position.y === start.y && position.type === 1) {
        return { ...position, type: 2 };
      } else {
        return position;
      }
    });
  blizzards = newBlizzards;
  if (newPositions.some((position) => position.x === end.x && position.y === end.y && position.type === 2)) {
    console.log('minute', minute);
    log();
    console.log('\x1b[4m\x1b[32mFound:\x1b[0m', minute);
    break;
  }
  minute++;
}



