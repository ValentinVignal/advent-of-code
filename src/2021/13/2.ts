import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const [pointsTextInput, foldsTextInput] = textInput.split('\n\n');

type Point = {
  x: number;
  y: number;
}
let points: Point[] = pointsTextInput.split('\n').filter(Boolean).map((line) => {
  const [x, y] = line.split(',').map(Number);
  return { x, y };
});

type Direction = 'x' | 'y';

type Fold = {
  direction: Direction;
  position: number;
}

const folds: Fold[] = foldsTextInput.split('\n').filter(Boolean).map((line) => {
  const text = line.split('fold along ')[1];
  const [direction, positionText] = text.split('=');
  return {
    direction: direction as Direction,
    position: parseInt(positionText),
  }
});

for (const fold of folds) {
  switch (fold.direction) {
    case 'x': {
      points = points.map((point) => {
        if (point.x > fold.position) {
          return { x: 2 * (fold.position) - point.x, y: point.y };
        }
        return point
      });
      break;
    }
    case 'y': {
      points = points.map((point) => {
        if (point.y > fold.position) {
          return { x: point.x, y: 2 * (fold.position) - point.y };
        }
        return point
      });
      break;
    }
  }
}


const maxX = Math.max(...points.map(({ x }) => x));
const maxY = Math.max(...points.map(({ y }) => y));

const grid: boolean[][] = Array.from({ length: maxY + 1 }, () => Array.from({ length: maxX + 1 }, () => false));

for (const { x, y } of points) {
  grid[y][x] = true;
}

const result = grid.map((row) => row.map((cell) => cell ? '#' : '.').join('')).join('\n');

// cSpell: disable-next-line
console.log(result); // RLBCJGLU

/*
###..#....###...##....##..##..#....#..#
#..#.#....#..#.#..#....#.#..#.#....#..#
#..#.#....###..#.......#.#....#....#..#
###..#....#..#.#.......#.#.##.#....#..#
#.#..#....#..#.#..#.#..#.#..#.#....#..#
#..#.####.###...##...##...###.####..##.
*/
