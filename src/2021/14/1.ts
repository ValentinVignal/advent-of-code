import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const [polymerText, templatesText] = textInput.split('\n\n');

let polymer = polymerText.split('');

type Template = {
  from: [string, string];
  to: string;
}

const templates: Template[] = templatesText.split('\n').map((template) => {
  const [fromText, to] = template.split(' -> ');
  const [a, b] = fromText.split('');
  return { from: [a, b], to };
});

for (let step = 0; step < 10; step++) {
  let newPolymer: string[] = [];
  for (let i = 0; i < polymer.length - 1; i++) {
    const a = polymer[i];
    newPolymer.push(a);
    const b = polymer[i + 1];
    const template = templates.find((template) => template.from[0] === a && template.from[1] === b);
    if (template) {
      newPolymer.push(template.to);
    }
  }
  newPolymer.push(polymer[polymer.length - 1]);
  polymer = newPolymer;
}

const counts = new Map<string, number>();
for (const unit of polymer) {
  counts.set(unit, (counts.get(unit) ?? 0) + 1);
}

const max = Math.max(...counts.values());
const min = Math.min(...counts.values());

const result = max - min;

console.log(result); // 2010
