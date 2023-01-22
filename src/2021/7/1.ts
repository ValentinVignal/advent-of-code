import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split(',').filter(Boolean).map(Number);

const median = input.sort((a, b) => b - a)[Math.floor(input.length / 2)];

const fuels = input.reduce((acc, x) => acc + Math.abs(x - median), 0);

// x < 358844
console.log(fuels); // 340056
