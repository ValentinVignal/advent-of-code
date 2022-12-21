import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();

const decryptionKey = 811589153;

type Entry = {
  num: number;
  originalIndex: number;
}

const list: Entry[] = textInput.split('\n').filter(Boolean).map(
  (line, index) => ({
    num: parseInt(line) * decryptionKey,
    originalIndex: index,
  })
);

const length = list.length;

const mod = (x: number) => {
  return ((x % length) + length) % length;
}

for (let i = 0; i < 10; i++) {
  for (let index = 0; index < length; index++) {
    const currentIndex = list.findIndex((entry) => entry.originalIndex === index);
    const entry = list.splice(currentIndex, 1)[0];
    let newIndex = currentIndex + entry.num;
    let delta = Math.trunc(newIndex / (length - 1));
    if (newIndex < 0) {
      delta--;
    }
    newIndex = mod(newIndex + delta);
    list.splice(newIndex, 0, entry);
  }
}

console.log(list);

const index0 = list.findIndex((entry) => entry.num === 0);
let result = 0;
for (let i = 1; i <= 3; i++) {
  result += list[mod(index0 + 1000 * i)].num;
}
console.log(result); // 2023

