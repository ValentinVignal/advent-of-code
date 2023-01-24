import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => line.split('').map(Number));

let flashes = 0;

type Position = {
  x: number;
  y: number;
}


for (let step = 1; step <= 100; step++) {
  const queue: Position[] = [];
  for (let x = 0; x < input[0].length; x++) {
    for (let y = 0; y < input.length; y++) {
      input[y][x]++;
      if (input[y][x] > 9) {
        queue.push({ x, y });
      }
    }
  }

  while (queue.length) {
    const { x, y } = queue.pop()!;
    if (input[y][x] === 0) continue;
    flashes++;
    input[y][x] = 0;
    for (const dx of [-1, 0, 1] as const) {
      for (const dy of [-1, 0, 1] as const) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= input[0].length || ny < 0 || ny >= input.length) continue;
        if (input[ny][nx] === 0) continue;
        input[ny][nx]++;
        if (input[ny][nx] > 9) {
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }
}

// x < 4335
console.log(flashes); // 1637
