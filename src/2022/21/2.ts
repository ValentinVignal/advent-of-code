import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();

type Monkey = {
  name: string
  num?: number;
  operation?: () => number;
}

const monkeyMap = new Map<Monkey['name'], Monkey>();

let x = 0;

// We assume root(x) is monotonous (in my case decreasing).
// root(x) > 0 so we start with a big delta and increase x as long as root(x) > 0.
// When root(x) < 0, we divide delta by 2 and decrease x by delta.

let delta = 2 ** 30;

const evalMonkey = (monkeyName: Monkey['name']): number => {
  if (monkeyName === 'humn') return x;
  const monkey = monkeyMap.get(monkeyName)!;
  return monkey.num ?? monkey.operation!();
}


const monkeyList: Monkey[] = textInput.split('\n').filter(Boolean).map((line) => {
  const name = line.split(':')[0];
  const rest = line.split(':')[1].trim();

  const monkey: Monkey = {
    name,
  };

  if (isNaN(parseInt(rest))) {
    const [left, op, right] = rest.split(' ');
    monkey.operation = () => {
      const leftEval = evalMonkey(left);
      const rightEval = evalMonkey(right);
      if (name === 'root') return leftEval - rightEval;
      switch (op) {
        case '+':
          return leftEval + rightEval;
        case '-':
          return leftEval - rightEval
        case '*':
          return leftEval * rightEval;
        case '/':
          return leftEval / rightEval
        default:
          throw Error(`Unsupported operator: ${op}`);
      }
    }
  } else {
    monkey.num = parseInt(rest);
  }
  return monkey
});

for (const monkey of monkeyList) {
  monkeyMap.set(monkey.name, monkey);
}

let result: number | null = null;

let iteration = 0;
while (true) {
  iteration++;
  const root = evalMonkey('root');
  if (!(iteration % 100000)) {
    console.log(iteration, x, delta, root);
  }
  if (root === 0) {
    result = x;
    break;
  } else if (root > 0) {
    x += delta
  } else {
    delta /= 2;
    x -= delta;
  }
}

console.log(result); // 3592056845086
