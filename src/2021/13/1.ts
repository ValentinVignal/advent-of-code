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

const fold = folds[0];

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

const result = new Set(points.map(({ x, y }) => (`${x}-${y}`))).size;

console.log(result); // 689
