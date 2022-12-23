import { readFileSync } from 'fs';
import * as path from 'path';


const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type GroundType = '.' | '#';

const input: GroundType[][] = textInput.split('\n').filter(Boolean).map((line) => {
  return line.split('') as GroundType[];
});

type Position = {
  x: number;
  y: number;
}

const positionToString = ({ x, y }: Position): string => `${x},${y}`;
const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(',').map(Number);
  return { x, y };
};

class Grid {
  set = new Set<string>();

  has(position: Position): boolean {
    return this.set.has(positionToString(position));
  }

  add(position: Position): void {
    this.set.add(positionToString(position));
  }

  delete(position: Position): void {
    this.set.delete(positionToString(position));
  }

  get entries(): Position[] {
    return Array.from(this.set).map(stringToPosition);
  }
}

let grid = new Grid();

for (let y = 0; y < input.length; y++) {
  for (let x = 0; x < input[y].length; x++) {
    if (input[y][x] === '#') {
      grid.add({ x, y });
    }
  }
}
const elvesNumber = grid.set.size;

type Direction = {
  checks: Position[];
  move: Position;
}

let directions: Direction[] = [
  // North
  {
    checks: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ],
    move: { x: 0, y: -1 },
  },
  // South
  {
    checks: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    move: { x: 0, y: 1 },
  },
  // West
  {
    checks: [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
    ],
    move: { x: -1, y: 0 },
  },
  // East
  {
    checks: [
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    move: { x: 1, y: 0 },
  },
];

type PlannedMoves = Map<number, Map<number, Set<string>>>

const allChecks: Position[] = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

const planMoves = (): PlannedMoves => {
  const plannedMoves = new Map<number, Map<number, Set<string>>>();

  for (const position of grid.entries) {

    const addPosition = ({ x, y }: Position): void => {
      if (!plannedMoves.has(x)) {
        plannedMoves.set(x, new Map());
      }
      const column = plannedMoves.get(x)!;

      if (!column.has(y)) {
        column.set(y, new Set());
      }
      column.get(y)!.add(positionToString(position));
    }

    let newPosition = position;

    if (allChecks.some((check) => grid.has({ x: position.x + check.x, y: position.y + check.y }))) {
      for (const direction of directions) {
        if (direction.checks.every((check) => !grid.has({ x: position.x + check.x, y: position.y + check.y }))) {
          const x = position.x + direction.move.x;
          const y = position.y + direction.move.y;
          newPosition = { x, y };
          break;
        }
      }
    }

    addPosition(newPosition);
  }

  return plannedMoves;
}

const move = (plannedMoves: PlannedMoves): void => {
  const newGrid = new Grid();
  for (const x of plannedMoves.keys()) {
    for (const y of plannedMoves.get(x)!.keys()) {
      const positions = plannedMoves.get(x)!.get(y)!;
      if (positions.size === 1) {
        newGrid.add({ x, y });
      } else {
        for (const position of positions) {
          newGrid.add(stringToPosition(position));
        }
      }
    }
  }
  grid = newGrid;
}



for (let round = 0; round < 10; round++) {
  const plannedMoves = planMoves();
  move(plannedMoves);

  // Update the directions order.
  directions.push(directions.shift()!);
}

const maxX = Math.max(...grid.entries.map(({ x }) => x));
const minX = Math.min(...grid.entries.map(({ x }) => x));
const maxY = Math.max(...grid.entries.map(({ y }) => y));
const minY = Math.min(...grid.entries.map(({ y }) => y));

const rectSize = (maxX - minX + 1) * (maxY - minY + 1);
const emptyTiles = rectSize - elvesNumber;
console.log(emptyTiles); // 4241


