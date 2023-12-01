import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const lines = textInput.split('\n').filter(Boolean);

const regexp = /^[^\d]*(\d).*(\d)[^\d]*$/;
const regexpOneNumber = /^.*(\d).*$/;

const sum = lines.reduce((acc, line) => {
  let res = line.match(regexp);
  let n: number;
  if (res) {
    const [, firstString, secondString] = res.values();
    n = Number(firstString + secondString);
  } else {
    const res = line.match(regexpOneNumber)!;
    const [, firstString] = res.values();
    n = Number(firstString + firstString);
  }
  return acc + n;
}, 0);

// 38613 < x
console.log(sum); // 54573

