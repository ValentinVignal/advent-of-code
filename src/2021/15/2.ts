import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Position = {
  x: number;
  y: number;
};

const smallMap = textInput.split('\n').filter(Boolean).map((line) => line.split('').map(Number));

const map = Array.from({ length: smallMap.length * 5 }, (_, y) => Array.from({ length: smallMap[0].length * 5 }, (_, x) => {

  return ((smallMap[y % smallMap.length][x % smallMap[0].length] + Math.floor(y / smallMap.length) + Math.floor(x / smallMap[0].length) - 1) % 9) + 1;
}));

const positionToKey = ({ x, y }: Position) => `${x},${y}`;
const keyToPosition = (key: string): Position => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

const visited = new Map<string, number>();

const queue = new Map<string, number>();
queue.set(positionToKey({ x: 0, y: 0 }), 0);

while (queue.size) {
  const [key, risk] = [...queue.entries()].sort((a, b) => a[1] - b[1])[0];
  queue.delete(key);
  const { x, y } = keyToPosition(key);
  visited.set(key, risk);

  if (x === map[0].length - 1 && y === map.length - 1) {
    break;
  }

  for (const { dx, dy } of [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }] as const) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || ny >= map.length || nx >= map[ny].length) continue;
    const newKey = positionToKey({ x: nx, y: ny });
    if (visited.has(newKey)) continue;
    const newRisk = risk + map[ny][nx];
    if (!queue.has(newKey) || queue.get(newKey)! > newRisk) {
      queue.set(newKey, newRisk);
    }
  }
}

const result = visited.get(positionToKey({ x: map[0].length - 1, y: map.length - 1 }))!;

// 1569 < 2385 < x
console.log(result); // 3012


