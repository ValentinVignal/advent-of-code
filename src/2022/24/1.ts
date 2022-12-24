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

const blizzards: Blizzard[] = [];

for (const [y, line] of textMap.entries()) {
  for (const [x, tile] of line.entries()) {
    if (!['.', '#'].includes(tile)) {
      blizzards.push({ x, y, type: tile as BlizzardType });
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

type State = {
  position: Position;
  blizzards: Blizzard[];
  minute: number;
}

const queue: State[] = [{ position: start, blizzards, minute: 0 }];
let minMoves = Infinity;
let i = 0;
while (queue.length) {
  i++;
  // TODO: Stop if too far.
  const { position, blizzards, minute }: State = JSON.parse(JSON.stringify(queue.shift()!));
  if (!(i % 1000)) {
    console.log('i', i, queue.length, minute);
  }
  if (position.x === end.x && position.y === end.y) {
    console.log('Found a path!', minute);
    minMoves = Math.min(minMoves, minute);
    continue;
  }

  const newMinute = minute + 1;
  const newPositions: Position[] = [];
  const newBlizzards = moveBlizzards(blizzards);

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
  if (position.y < lengthY - 2) {
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
  if (position.x > 1) {
    canMoveLeft = !newBlizzards.some((blizzard) => blizzard.x === position.x - 1 && blizzard.y === position.y);
  }
  if (canMoveLeft) {
    newPositions.push({ x: position.x - 1, y: position.y });
  }

  // Right:
  let canMoveRight = false;
  if (position.x < lengthX - 2) {
    canMoveRight = !newBlizzards.some((blizzard) => blizzard.x === position.x + 1 && blizzard.y === position.y);
  }
  if (canMoveRight) {
    newPositions.push({ x: position.x + 1, y: position.y });
  }

  // No move:
  if (!newBlizzards.some((blizzard) => blizzard.x === position.x && blizzard.y === position.y)) {
    newPositions.push(position);
  }

  queue.push(
    ...newPositions.map((position) => {
      return { position, blizzards: newBlizzards, minute: newMinute };
    }),
  );
}

console.log(minMoves);


