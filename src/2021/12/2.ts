import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = new Map<string, string[]>();

for (const line of textInput.split('\n').filter(Boolean)) {
  const [a, b] = line.split('-');

  const aTos = (input.get(a) ?? [])
  aTos.push(b)
  input.set(a, aTos);

  const bTos = (input.get(b) ?? [])
  bTos.push(a)
  input.set(b, bTos);
}

const paths = new Set<string>();

const canVisit = (path: string[], to: string): boolean => {
  if (to.toUpperCase() === to) return true;
  if (!path.includes(to)) return true;
  if (to === 'end' || to === 'start') return false;
  return path.filter((to) => to.toUpperCase() !== to).every((to, index, arr) => arr.indexOf(to) === index);
}

const visit = (path: string[]): void => {
  const last = path[path.length - 1];
  const tos = input.get(last);
  if (!tos) {
    // Dead end.
    return;
  }
  for (const to of tos) {
    if (to === 'end') {
      paths.add([...path, to].join(','));
    } else if (canVisit(path, to)) {
      visit([...path, to]);
    }
  }
}

visit(['start']);

console.log(paths.size); // 150004
