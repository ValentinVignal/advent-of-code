import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const [polymerText, templatesText] = textInput.split('\n\n');

/**
 * ```ts
 * {
 *   'AB': 3,
 *   'AC': 2,
 * }
 * ```
 */
let polymer = new Map<string, number>();

for (let i = 0; i < polymerText.length - 1; i++) {
  const a = polymerText[i];
  const b = polymerText[i + 1];
  const key = a + b;
  polymer.set(key, (polymer.get(key) ?? 0) + 1);
}

const templates = new Map<string, string>();

for (const templateText of templatesText.split('\n').filter(Boolean)) {
  const [from, to] = templateText.split(' -> ');
  templates.set(from, to);
};

for (let step = 0; step < 40; step++) {
  const newPolymer = new Map<string, number>();
  for (const [key, count] of polymer) {
    const result = templates.get(key);
    if (result) {
      const key1 = key[0] + result;
      const key2 = result + key[1];
      newPolymer.set(key1, (newPolymer.get(key1) ?? 0) + count);
      newPolymer.set(key2, (newPolymer.get(key2) ?? 0) + count);
    } else {
      newPolymer.set(key, (newPolymer.get(key) ?? 0) + count);
    }
  }
  polymer = newPolymer;
}


const counts = new Map<string, number>();
for (const [unit, count] of polymer) {
  const [a, b] = unit.split('');
  counts.set(a, (counts.get(a) ?? 0) + count);
  counts.set(b, (counts.get(b) ?? 0) + count);
}

counts.set(polymerText[0], (counts.get(polymerText[0]) ?? 0) + 1);
counts.set(polymerText[polymerText.length - 1], (counts.get(polymerText[polymerText.length - 1]) ?? 0) + 1);

for (const [key, value] of counts) {
  counts.set(key, Math.ceil(value / 2));
}

const max = Math.max(...counts.values());
const min = Math.min(...counts.values());

const result = max - min;

// 694373141448 < 694373141449 < 694373141449 < x
console.log(result); // 2437698971143
